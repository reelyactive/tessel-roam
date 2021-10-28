/*
 * Copyright reelyActive 2021
 * We believe in an open Internet of Things
 */

'use strict';

const tessel = require('tessel');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const Barnowl = require('barnowl');
const BarnowlReel = require('barnowl-reel');
const BarnowlTcpdump = require('barnowl-tcpdump');
const Raddec = require('raddec');
const RaddecFilter = require('raddec-filter');
const config = require('./config');

// Load the configuration parameters
const barnowlOptions = {
    enableMixing: config.enableMixing,
    mixingDelayMilliseconds: config.mixingDelayMilliseconds
};
const raddecFilterParameters = config.raddecFilterParameters;
const isDebugMode = config.isDebugMode;

// Constants
const REEL_BAUD_RATE = 230400;
const REEL_DECODING_OPTIONS = {
    maxReelLength: 1,
    minPacketLength: 8,
    maxPacketLength: 39
};
const RECEIVER_ID_TYPE_BLE = 1;  // EUI-64
const RECEIVER_ID_TYPE_WIFI = 2; // EUI-48


// GPS readings and logfile are global variables
let lat = '';
let lon = '';
let speed = '';
let course = '';
let timestamp = '';
let logfile = null;


// Set USB GPS serial baud rate
exec('stty -F "/dev/ttyUSB0" 4800', handleError);
let gps = fs.createReadStream(config.gpsMountPoint, { encoding: 'ascii' }); 
gps.addListener('data', handleNmeaData);


// Create raddec filter
let filter = new RaddecFilter(raddecFilterParameters);

// Create barnowl instance with the configuration options
let barnowl = new Barnowl(barnowlOptions);

// Have barnowl listen for reel data, if selected in configuration
if(config.listenToReel) {
  let uart = new tessel.port['A'].UART({ baudrate: REEL_BAUD_RATE });
  barnowl.addListener(BarnowlReel, {}, BarnowlReel.EventListener,
                      { path: uart, decodingOptions: REEL_DECODING_OPTIONS });
}

// Have barnowl listen for tcpdump data, if selected in configuration
if(config.listenToTcpdump) {
  barnowl.addListener(BarnowlTcpdump, {}, BarnowlTcpdump.SpawnListener, {});
}

// Write the raddec to logfile while pulsing the green LED
barnowl.on('raddec', function(raddec) {
  tessel.led[2].on();
  if(filter.isPassing(raddec)) {
    writeLogfile(raddec);
  }
  tessel.led[2].off();
});

// Blue LED continuously toggles to indicate program is running
setInterval(function() { tessel.led[3].toggle(); }, 500);


/**
 * Handle the given chunk of NMEA message data from the GPS serial stream.
 * @param {String} data The chunk of NMEA messages.
 */
function handleNmeaData(data) {
  let rmcStart = data.indexOf('$GPRMC');
  
  if(rmcStart >= 0) {
    let rmcEnd = data.indexOf('\n', rmcStart);

    if(rmcEnd) {
      let elements = data.substring(rmcStart, rmcEnd).split(',');

      if(elements[3] === '') { lat = '' }                // Latitute
      else {
        lat = (Math.floor(Number(elements[3]) / 100) +
               ((Number(elements[3]) * 10000 % 1000000) / 600000)).toFixed(5);
        if(elements[4] === 'S') { lat = -lat; }
      }

      if(elements[5] === '') { lon = '' }                // Longitude
      else {
        lon = (Math.floor(Number(elements[5]) / 100) +
               ((Number(elements[5]) * 10000 % 1000000) / 600000)).toFixed(5);
        if(elements[6] === 'W') { lon = -lon; }
      }

      if(elements[7] === '') { speed = '' }              // Speed
      else { speed = Number(elements[7]).toFixed(1); }

      if(elements[8] === '') { course = '' }             // Course
      else { course = Number(elements[8]).toFixed(1); }

      if((elements[9] !== '') && (elements[1] !== '')) { // Time/Date
        let day = parseInt(elements[9].substring(0, 2));
        let month = parseInt(elements[9].substring(2, 4));
        let year = parseInt(elements[9].substring(4, 6)) + 2000;
        let hours = parseInt(elements[1].substring(0, 2));
        let minutes = parseInt(elements[1].substring(2, 4));
        let seconds = parseInt(elements[1].substring(4, 6));
        let date = new Date(year, month - 1, day, hours, minutes, seconds);
        timestamp = date.getTime();
      }
      else { timestamp = ''; }
    }
  }
}


/**
 * Write the given raddec to the current logfile.
 * @param {Object} raddec The raddec to write.
 */
function writeLogfile(raddec) {
  if(timestamp === '') {
    return; // TODO: handle absence of GPS time?
  }

  let logfileRotationThreshold = timestamp -
                                 (config.logfileMinutesToRotation * 60000);
  let isNewLogfileRequired = !logfile || (logfile.lastRotationTimestamp <
                                          logfileRotationThreshold);

  if(isNewLogfileRequired) {
    createNewLogfile();
  }

  let flatRaddec = raddec.toFlattened();
  let csvLine = timestamp + config.logfileDelimiter +
                Date.now() + config.logfileDelimiter +
                flatRaddec.transmitterId + config.logfileDelimiter +
                flatRaddec.transmitterIdType + config.logfileDelimiter +
                flatRaddec.rssi + config.logfileDelimiter +
                lat + config.logfileDelimiter + lon + config.logfileDelimiter +
                speed + config.logfileDelimiter + course + '\r\n';

  if(flatRaddec.receiverIdType === RECEIVER_ID_TYPE_BLE) {
    logfile.writeStreamBle.write(csvLine);
  }
  else if(flatRaddec.receiverIdType === RECEIVER_ID_TYPE_WIFI) {
    logfile.writeStreamWiFi.write(csvLine);
  }
}


/**
 * Create a new logfile, closing the previous logfile, if applicable.
 */
function createNewLogfile() {
  if(logfile) {
    logfile.writeStreamBle.end();
    logfile.writeStreamWiFi.end();
  }

  let filenameBle = config.logfileNamePrefix + '-ble-' +
                    createCurrentTimeString(timestamp) +
                    config.logfileExtension;
  let filepathBle = path.join(config.storageMountPoint, filenameBle);
  let writeStreamBle = fs.createWriteStream(filepathBle, { flags: "a" });

  let filenameWiFi = config.logfileNamePrefix + '-wifi-' +
                     createCurrentTimeString(timestamp) +
                     config.logfileExtension;
  let filepathWiFi = path.join(config.storageMountPoint, filenameWiFi);
  let writeStreamWiFi = fs.createWriteStream(filepathWiFi, { flags: "a" });

  logfile = {
      writeStreamBle: writeStreamBle,
      writeStreamWiFi: writeStreamWiFi,
      lastRotationTimestamp: timestamp
  }

  writeStreamBle.on('error', handleError);
  writeStreamWiFi.on('error', handleError);
}


/**
 * Return a time/date string in the form YYMMDD-HHMMSS
 * @param {Number} timestamp The timestamp as a UNIX epoch.
 * @return {String} The thirteen-digit string.
 */
function createCurrentTimeString(timestamp) {
  let date = new Date(timestamp);
  let timestring = date.getFullYear().toString().slice(-2);
  timestring += ('0' + (date.getMonth() + 1)).slice(-2);
  timestring += ('0' + date.getDate()).slice(-2);
  timestring += '-';
  timestring += ('0' + date.getHours()).slice(-2);
  timestring += ('0' + date.getMinutes()).slice(-2);
  timestring += ('0' + date.getSeconds()).slice(-2);

  return timestring;
}


/**
 * Handle the given error by blinking the red LED and, if debug mode is enabled,
 * print the error to the console.
 * @param {Object} err The error to handle.
 */
function handleError(err) {
  tessel.led[0].on();
  if(isDebugMode) {
    console.log(err);
  }
  tessel.led[0].off();
}
