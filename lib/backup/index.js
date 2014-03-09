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
var btrfs = require('../btrfs');
var rsync = require("rsyncwrapper").rsync;

// Date string might be improved with: http://stackoverflow.com/a/18906013/2251810

module.exports = function(config, callback) {
    var backup = new Backup();
    
    
    if (!config.hasOwnProperty('backuppath')) {
        callback(new Error("Missing configuration parameter: backuppath"));
        return;
    }
    backup.fullPath = path.resolve(config.backuppath);
    
    if (!config.hasOwnProperty('name')) {
        callback(new Error("Missing configuration parameter: name"));
        return;
    }
    backup.name = config.name;

    if (!config.hasOwnProperty('rsync')) {
        callback(new Error("Missing configuration: rsync"));
        return;
    }
    backup.rsyncconfig = config.rsync;
    backup.rsyncconfig.dest = path.resolve(backup.fullPath, backup.name);
    backup.rsyncconfig.syncDest = true;
    backup.rsyncconfig.recursive = true;
    backup.rsyncconfig.args = [
        "-a", // Archive shortcut for: rlptgoD
              // r: Recursive
              // l: Copy symlinks as symlinks
              // p: Preserve permissions
              // t: Preserver time
              // g: Preserve group
              // o: Preserver owner
              // D: Preserver device and special files
        "-R", // Use full path names
        // "-v", // Verbose (not used as process might get killed of too long output
        "-z", // Compress during transmission
        "--numeric-ids", // Transfer numeric GIDs and UIDs instead of names
        "--inplace", // update destination files in-place
        "--hard-links", // Preserve hard links
    ];

    if (config.hasOwnProperty('minInterval')) {
        if (typeof(config.minInterval)=="number") {
            backup.interval = config.minInterval;
        }
        else if (typeof(config.minInterval)=="string") {
            var suffix=config.minInterval.slice(-1);
            var number=parseFloat(config.minInterval.slice(0,-1));
            if (suffix=="d") {
                backup.interval = number * 24*60*60*1000;
            }
            else if (suffix=="h") {
                backup.interval = number * 60*60*1000;
            }
            else if (suffix=="m") {
                backup.interval = number * 60*1000;
            }
            else if (suffix=="s") {
                backup.interval = number * 1000;
            }
            else {
                callback(new Error("Unknown interval format: " + config.minInterval));
                return;
            }
        }
        else {
            callback(new Error("Unknown interval format: " + config.minInterval));
            return;
        }
    }
    else {
        backup.interval = 0;
    }


    
    backup.backupFS;
    
    btrfs(backup.fullPath, function(err, res){
        if (err) {
            callback(err);
        }
        else {
            backup.backupFS=res;
            backup.backupFS.isSubvolume(backup.name, function(err, res) {
                if (err) {
                    callback(err);
                }
                else if (!res) {
                    backup.backupFS.createSubvolume(backup.name, function(err, res) {
                        if (err) {
                            callback(err);
                        }
                        else {
                            callback(null, backup);
                        }
                    });
                }
                else {
                    callback(null, backup);
                }
            });
        }
    });
};

var Backup = function() {
}

Backup.prototype.start = function(callback) {
    var interval = this.interval;
    var backupFS = this.backupFS;
    var name = this.name;
    var rsyncconfig=this.rsyncconfig;
    
    rsync(rsyncconfig, function(err, stdout, stderr, cmd){
        if (err) {
            callback(stderr);
        }
        else {
            var datestring=(new Date()).toISOString();
            backupFS.createSnapshot(name, name + "." + datestring, function(err, res) {
                if (err) {
                    callback(err);
                }
                else {
                    callback(null, true);
                }
            });
        }
    });
};



Backup.prototype.isPending = function(callback) {
    var interval = this.interval;
    var backupFS = this.backupFS;
    var name = this.name;
    
    this.getSnapshots(function(err, snapshots) {
        if (err) {
            callback(err);
        }
        else {
            if (snapshots.length > 0 && ( ((new Date()).getTime() - snapshots[0].getTime()) < interval ) ){
                callback(null, false);
            }
            else {
                callback(null, true);
            }
        }
    });   
};

Backup.prototype.getSnapshots = function(callback) {
    var name = this.name;
    
    fs.readdir(this.fullPath, function(err, files) {
        if (err) {
            callback(err);
        }
        else {
            var snapshotDates=[];
            // \d in regexp is not working
            var regPattern = new RegExp(name+'\.(....-..-..T..:..:..\....Z)');
            var match;
            for (var i = 0; i < files.length; i++) {
                if (match = regPattern.exec(files[i])) {
                    snapshotDates.push(new Date(match[1]));
                }
            }
            snapshotDates.sort(date_sort_desc);
            callback(null, snapshotDates);
        }
    });
};

var date_sort_desc = function (date1, date2) {
    if (date1 > date2) return -1;
    if (date1 < date2) return 1;
    return 0;
};
