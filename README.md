tessel-roam
===========

Collect geolocated radio decodings from a [reelyActive Owl-in-One](https://www.reelyactive.com/products/gateways/#owl-in-one) based on the [Tessel 2](https://tessel.io/) platform.  Geolocates using a USB GPS and writes radio decodings ([raddecs](https://github.com/reelyactive/raddec/)) from a reel module (BLE) and/or from tcpdump (WiFi) to a USB drive.

For complementary functionality, consider instead:
- [tessel-edge](https://github.com/reelyactive/tessel-edge) for real-time packet forwarding
- [tessel-monitor](https://github.com/reelyactive/tessel-monitor) to monitor Bluetooth Low Energy advertising traffic dynamics

Consult the following tutorials as step-by-step configuration guides:
- [Configure an Owl-in-One](https://reelyactive.github.io/diy/oio-config/)
- [Create a WLAN of Owl-in-Ones and a laptop](https://reelyactive.github.io/diy/oio-wlan/)

Installation
------------

Clone this repository, browse to its root, then run:

    npm install


Configuration
-------------

All configuration parameters can be found in the file __config.js__.  Update only this file, as required.

| Parameter                   | Description                                   | 
|:----------------------------|:----------------------------------------------|
| LISTEN_TO_REEL              | Enable listener on reel module (default: true)|
| LISTEN_TO_TCPDUMP           | Enable listener on tcpdump (default: false)   |
| ENABLE_MIXING               | Combine multiple decodings of an individual transmitter into a single raddec (default: true) |
| MIXING_DELAY_MILLISECONDS   | Mixing delay of radio decodings (default: 1000) |
| RADDEC_FILTER_PARAMETERS    | (see [raddec-filter](https://github.com/reelyactive/raddec-filter/))                           |
| LOGFILE_NAME_PREFIX         | (default: 'roamlog')                          |
| LOGFILE_EXTENSION           | (default: '.csv')                             |
| LOGFILE_DELIMITER           | (default: ',')                                |
| LOGFILE_MINUTES_TO_ROTATION | (default: 60)                                 |
| STORAGE_MOUNT_POINT         | (default: '/mnt/sda1')                        |
| GPS_MOUNT_POINT             | (default: '/dev/ttyUSB0')                     |
| IS_DEBUG_MODE               | Set true and `t2 run index.js` for console log|


Programming
-----------

Programming the Tessel 2 requires the [t2-cli](https://www.npmjs.com/package/t2-cli) package which can be installed by following [these instructions](https://tessel.github.io/t2-start/).

With the Tessel 2 connected to the programming station via USB, from the root of this repository run:

    t2 push index.js

The code will be pushed to flash memory on the Tessel and will run every time it boots.


Output
------

By default, __tessel-roam__ will write to logfiles _roamlog-ble-YYMMDD-HHMMSS.csv_ and _roamlog-wifi-YYMMDD-HHMMSS.csv_, which it will rotate every 60 minutes, the following comma-separated values:

GPS Epoch,CPU Epoch,transmitterId,transmitterIdType,rssi,lat,lon,speed,course


Prerequisites
-------------

The __tessel-roam__ software expects the following:
- a reel or reelceiver module connected via UART on Port A
- maximum baud rate of Port A set to at least 230400
- tcpdump installed (only if LISTEN_TO_TCPDUMP is true)
- coreutils-stty installed
- GPS module connected via USB
- thumb drive connected via USB


License
-------

MIT License

Copyright (c) 2021-2022 [reelyActive](https://www.reelyactive.com)

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR 
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, 
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE 
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER 
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, 
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN 
THE SOFTWARE.

