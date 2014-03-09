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

var fs = require('fs');
var path = require('path');
var exec = require("child_process").exec;

var btrfscommand="btrfs";

module.exports.isMountPoint = function(mountPath, callback) {
    var fullPath = path.resolve(mountPath);
    fs.readFile('/proc/mounts', 'ascii', function(err, data) {
        if (err) {
            callback(err);
        }
        else {
            var regPattern = new RegExp('.* '+fullPath+' .*');
            callback(null, regPattern.test(data));
        }
    });
};

module.exports.remount = function(mountPath, readwrite, callback) {
    if (typeof(readwrite)=='function') {
        callback = readwrite;
        readwrite = false;
    }
    
    var fullPath = path.resolve(mountPath);
    if (readwrite) {
        command="mount -o remount,rw "+fullPath;
    }
    else {
        command="mount -o remount,ro "+fullPath;
    }

    exec(command,
        function(error, stdout, stderr) {
            if (error) {
                callback(ne Error("Remounting failed:\n" + stderr));
            }
            else {
                callback(null);
            }
        }
    );
}
