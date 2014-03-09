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

var argv = require('minimist')(process.argv.slice(2));

var lock = require("./lock");
var mount = require('./mount');
var configHandler = require('./config');
var backup = require('./backup');


var config;
var unlock;


var main = function(callback) {
    configHandler.load(argv.config, function(err, res) {
        if (err) {
            callback(err);
        }
        else {
            config = res;
            unlock = lock(config.lockfile);
            if (unlock) {
                backup(config, function(err, mybackup) {
                    if (err) {
                        callback(err);
                    }
                    else {
                        mybackup.isPending(function(err, res) {
                            if (err) {
                                callback(err);
                            }
                            else {
                                if (res) {
                                    mybackup.start(function(err, res) {
                                        callback(err, res);
                                    });
                                }
                                else {
                                    callback(null, "Backup not pending");
                                }
                            }
                        });
                    }
                });
            }
            else {
                callback(new Error("Already locked"));
            }
        }
    });
};


module.exports.main = function() {
    main(function(err,res) {
        if (err) {
            console.log("ERROR:");
            console.log(err);
        }
        else
        {
            console.log("Success:");
            console.log(res);
        }

        if (unlock) {
            unlock();
        }
    });
};

    
    