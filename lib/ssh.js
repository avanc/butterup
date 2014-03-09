/*!
 * Copyright (C) 2014, Sven Klomp
 * 
 * Released under the MIT license
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"),
 * to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense,
 * and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS
 * IN THE SOFTWARE.
 *
 */

var net = require('net');

module.exports.available = function(host, callback){
    var client = new net.Socket();
    
    client.setTimeout(1000, function() {
        client.destroy();
        callback(new Error("Timeout for host " + host));
    });
    
    client.on("data", function(data) {
        callback(null);
    });
    
    client.on("error", function(err) {
        if (err.errno == "ENOTFOUND") {
            callback("Host " + host + " not found.");
        }
        else {
            callback(err);
        }
    });

    client.connect(22, host);
    
};
