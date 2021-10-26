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

// GPS readings are global variables
let lat = null;
let lon = null;
let timestamp = null;

// Set USB GPS serial baud rate
exec('stty -F "/dev/ttyUSB0" 4800', handleError);

let filepath = path.join(config.storageMountPoint, 'roam-test.txt'); // TODO
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

// Forward the raddec to each target while pulsing the green LED
barnowl.on('raddec', function(raddec) {
  tessel.led[2].on();
  if(filter.isPassing(raddec)) {
    let flatRaddec = raddec.toFlattened();
    let csvLine = timestamp + config.csvSeparator +
                  lat + config.csvSeparator + lon + config.csvSeparator +
                  flatRaddec.transmitterId + config.csvSeparator +
                  flatRaddec.transmitterIdType + config.csvSeparator +
                  flatRaddec.receiverId + config.csvSeparator +
                  flatRaddec.receiverIdType + config.csvSeparator +
                  flatRaddec.rssi;
    fs.writeFile(filepath, csvLine, handleError);
console.log(csvLine);
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
      // TODO: check if elements are non-empty
      let elements = data.substring(rmcStart, rmcEnd).split(',');
      lat = (Math.floor(Number(elements[3]) / 100) +
             ((Number(elements[3]) * 10000 % 1000000) / 600000)).toFixed(5);
      lon = (Math.floor(Number(elements[5]) / 100) +
             ((Number(elements[5]) * 10000 % 1000000) / 600000)).toFixed(5);
      if(elements[4] === 'S') { lat = -lat; }
      if(elements[6] === 'W') { lon = -lon; }
      let day = parseInt(elements[9].substring(0, 2));
      let month = parseInt(elements[9].substring(2, 4));
      let year = parseInt(elements[9].substring(4, 6)) + 2000;
      let hours = parseInt(elements[1].substring(0, 2));
      let minutes = parseInt(elements[1].substring(2, 4));
      let seconds = parseInt(elements[1].substring(4, 6));
      let date = new Date(year, month, day, hours, minutes, seconds);
      timestamp = date.getTime();
    }
  }
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
