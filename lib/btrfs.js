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

var path = require('path');
var exec = require("child_process").exec;

var btrfscommand="btrfs";

module.exports = function(backupPath, callback) {
    var fullPath = path.resolve(backupPath);
    
    testBtrfsCommand(function(err) {
        if (err) {
            callback(err);
        }
        else {
            isBtrfs(fullPath, function(err, res) {
                if (err) {
                    callback(err);
                }
                else {
                    callback(null, new Btrfs(fullPath));
                }
            });
        }
    });
};

function isBtrfs(btrfsPath, callback) {
    var fullPath = path.resolve(btrfsPath);
    exec(btrfscommand + ' filesystem label ' + btrfsPath,
        function(error, stdout, stderr) {
            if (error) {
                callback(new Error(btrfsPath + 'does not seem to be a btrfs:\n' + stderr));
            }
            else {
                callback(null);
            }
        }
    );
};
module.exports.isBtrfs = isBtrfs;

var testBtrfsCommand = function(callback) {
    var child = exec(btrfscommand + ' --version',
        function(error, stdout, stderr) {
            if (error) {
                callback(stderr);
            }
            else {
                callback();
            }
        });
};


var Btrfs = function(path) {
    this.path = path;
}

Btrfs.prototype.isSubvolume = function(name, callback) {
    var subvolumePath = path.relative(this.path, path.resolve(this.path, name));
    var command = btrfscommand + ' subvolume list ' + this.path;

    exec(command,
        function(error, stdout, stderr) {
            if (error) {
                callback(new Error("Failed to check subvolumes:\n" + stderr));
            }
            else {
                var regPattern = new RegExp('.* '+subvolumePath+'\n');
                callback(null, regPattern.test(stdout));
            }
        }
    );
}

Btrfs.prototype.createSubvolume = function(name, callback) {
    var subvolumePath = path.resolve(this.path, name);
    var command = btrfscommand + ' subvolume create ' + subvolumePath;

    exec(command,
        function(error, stdout, stderr) {
            if (error) {
                callback(new Error("Creating subvolume "+subvolumePath+" failed:\n" + stderr));
            }
            else {
                callback(null, subvolumePath);
            }
        }
    );
}

Btrfs.prototype.createSnapshot = function(source, destination, callback) {
    var subvolumePath = path.resolve(this.path, source);
    var snapshotPath = path.resolve(this.path, destination);
    
    var command = btrfscommand + ' subvolume snapshot -r ' + subvolumePath + '/ ' + snapshotPath;

    exec(command,
        function(error, stdout, stderr) {
            if (error) {
                callback(new Error("Creating snapshot failed:\n" + stderr));
            }
            else {
                callback(null, snapshotPath);
            }
        }
    );
}

Btrfs.prototype.removeSubvolume = function(name, callback) {
    var subvolumePath = path.resolve(this.path, name);
    var command = btrfscommand + ' subvolume delete ' + subvolumePath;

    exec(command,
        function(error, stdout, stderr) {
            if (error) {
                callback(new Error("Removing subvolume failed:\n" + stderr));
            }
            else {
                callback(null);
            }
        }
    );
}

