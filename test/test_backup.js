var should = require("should");
var backup = require("../lib/backup");

// Note:
// Some tests need a btrfs to run. To mount the example image, execute the following commands (some need root privileges):
// modprobe loop
// losetup /dev/loop0 /path/to/test/data/btrfs.img


describe('backup', function(){
    var config;
    
    beforeEach( function(){
        config = {};
        config.name = "mybackup";
        config.backuppath = "test/mnt/";
        config.minInterval = 0;
        config.rsync = {
            src : ['lib/'],
            recursive : true
        };
    });
    
    
    
    describe('(config)', function(){
        it('should return error if parameter is missing', function(done){
            delete config.backuppath;
            backup(config, function(err, res) {
                should.exist(err);
                done();
            });
        });

        it('should not return error if subvolume exist or can be created', function(done){
            backup(config, function(err, res) {
                should.not.exist(err);
                should.exist(res);
                res.should.have.property('name');
                done()
            });
        });

        it('should interpret "3d" correctly', function(done){
            config.minInterval = "3d";
            backup(config, function(err, res) {
                should.not.exist(err);
                should.exist(res);
                res.interval.should.be.equal(259200000);
                done()
            });
        });

        it('should interpret "11.5h" correctly', function(done){
            config.minInterval = "11.5h";
            backup(config, function(err, res) {
                should.not.exist(err);
                should.exist(res);
                res.interval.should.be.equal(41400000);
                done()
            });
        });

        it('should interpret "33m" correctly', function(done){
            config.minInterval = "33m";
            backup(config, function(err, res) {
                should.not.exist(err);
                should.exist(res);
                res.interval.should.be.equal(1980000);
                done()
            });
        });

        it('should interpret "1s" correctly', function(done){
            config.minInterval = "1s";
            backup(config, function(err, res) {
                should.not.exist(err);
                should.exist(res);
                res.interval.should.be.equal(1000);
                done()
            });
        });

        it('should return error if wrong intervall format is given', function(done){
            config.minInterval = "6x";
            backup(config, function(err, res) {
                should.exist(err);
                done()
            });
        });

        describe('.start()', function(){
            it('should return no error', function(done){
                backup(config, function(err, res) {
                    should.not.exist(err);
                    should.exist(res);
                    res.start(function(err, res) {
                        should.not.exist(err);
                        done()

                    });
                    
                });
            });
        });
        
        describe('.isPending()', function(){
            it('should return false if no backup is pending', function(done){
                config.minInterval = 60000;
                backup(config, function(err, res) {
                    should.not.exist(err);
                    should.exist(res);
                    res.isPending(function(err, res) {
                        should.not.exist(err);
                        should.exist(res);
                        res.should.be.false;
                        done()

                    });
                    
                });
            });

            it('should return true if backup is pending', function(done){
                config.minInterval = 0;
                backup(config, function(err, res) {
                    should.not.exist(err);
                    should.exist(res);
                    res.isPending(function(err, res) {
                        should.not.exist(err);
                        should.exist(res);
                        res.should.be.true;
                        done();
                    });
                });
            });
        });


        describe('.getSnapshots()', function(){
            it('should return array of dates', function(done){
                backup(config, function(err, res) {
                    should.not.exist(err);
                    should.exist(res);
                    res.getSnapshots(function(err, res) {
                        should.not.exist(err);
                        should.exist(res);
                        res.should.be.an.Array.and.have.lengthOf(1);
                        done()

                    });
                    
                });
            });
        });
        
        
    });
}) 