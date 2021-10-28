tessel-roam
===========

Collect geolocated radio decodings from a [reelyActive](https://www.reelyactive.com) __Owl-in-One__ based on the [Tessel 2](https://tessel.io/) platform.  Geolocates using a USB GPS and writes [raddecs](https://github.com/reelyactive/raddec/) from a reel module (BLE) and/or from tcpdump (WiFi) to a USB drive.


Installation
------------

Clone this repository, browse to its root, then run:

    npm install


Programming
-----------

Programming the Tessel 2 requires the [t2-cli](https://www.npmjs.com/package/t2-cli) package which can be installed by following [these instructions](http://tessel.github.io/t2-start/).

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
- tcpdump installed
- coreutils-stty installed
- GPS module connected via USB
- thumb drive connected via USB


License
-------

MIT License

Copyright (c) 2021 [reelyActive](https://www.reelyactive.com)

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR 
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, 
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE 
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER 
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, 
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN 
THE SOFTWARE.

