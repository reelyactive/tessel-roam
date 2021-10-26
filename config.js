/*
 * Copyright reelyActive 2021
 * We believe in an open Internet of Things
 */


const Raddec = require('raddec');


// Begin configurable parameters
// -----------------------------

const LISTEN_TO_REEL = true;
const LISTEN_TO_TCPDUMP = false;
const ENABLE_MIXING = true;
const MIXING_DELAY_MILLISECONDS = 1000;
const RADDEC_FILTER_PARAMETERS = {
    minRSSI: -99
};
const CSV_SEPARATOR = ',';
const STORAGE_MOUNT_POINT = '/mnt/sda1';
const GPS_MOUNT_POINT = '/dev/ttyUSB0';
const IS_DEBUG_MODE = false;

// ---------------------------
// End configurable parameters


module.exports.listenToReel = LISTEN_TO_REEL;
module.exports.listenToTcpdump = LISTEN_TO_TCPDUMP;
module.exports.enableMixing = ENABLE_MIXING;
module.exports.mixingDelayMilliseconds = MIXING_DELAY_MILLISECONDS;
module.exports.raddecFilterParameters = RADDEC_FILTER_PARAMETERS;
module.exports.csvSeparator = CSV_SEPARATOR;
module.exports.storageMountPoint = STORAGE_MOUNT_POINT;
module.exports.gpsMountPoint = GPS_MOUNT_POINT;
module.exports.isDebugMode = IS_DEBUG_MODE;
