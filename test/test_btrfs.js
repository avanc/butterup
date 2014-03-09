var should = require("should");
var Btrfs = require("../lib/btrfs");

// Note:
// Some tests need a btrfs to run. To mount the example image, execute the following commands (some need root privileges):
// modprobe loop
// losetup /dev/loop0 /path/to/test/data/btrfs.img


describe('Btrfs', function(){
    describe('(path)', function(){
        it('should return error if no such file or directory exists', function(done){
            Btrfs("/to/nowwhere", function(err, res) {
                should.exist(err);
                done()
            });
        });

        it('should return error if path is not a directory', function(done){
            Btrfs("./test/test_btrfs.js", function(err, res) {
                should.exist(err);
                done();
            });
        });

        it('should return error if path is not a mount point', function(done){
            Btrfs("./test/", function(err, res) {
                should.exist(err);
                done();
            });
        });

        it('should return error if path is not a btrfs', function(done){
            Btrfs("/", function(err, res) {
                should.exist(err);
                done();
            });
        });

        it('should return an instance of btrfs', function(done){
            Btrfs("test/mnt/", function(err, res) {
                should.not.exist(err);
                should.exist(res);
                res.should.have.property('path');
                done();
            });
        });
    
        describe('.createSubvolume()', function(){
            it('should not return an error when creating a subvolume', function(done){
                Btrfs("test/mnt/", function(err, res) {
                    res.createSubvolume("mybackup", function(err, res) {
                        should.not.exist(err);
                        should.exist(res);
                        res.should.be.string;
                        done();
                    });
                });
            });
        });
        
        describe('.createSnapshot()', function(){
            it('should not return an error when creating a snapshot', function(done){
                Btrfs("test/mnt/", function(err, res) {
                    res.createSnapshot("mybackup", "mybackup-snapshot", function(err, res) {
                        should.not.exist(err);
                        should.exist(res);
                        res.should.be.string;
                        done();
                    });
                });
            });
        });

        describe('.isSubvolume()', function(){
            it('should not return an error if path is a subvolume', function(done){
                Btrfs("test/mnt/", function(err, res) {
                    res.isSubvolume("mybackup", function(err, res) {
                        should.not.exist(err);
                        should.exist(res);
                        res.should.be.true;
                        done();
                    });
                });
            });
        });

        describe('.isSubvolume()', function(){
            it('should return an error if path is not subvolume', function(done){
                Btrfs("test/mnt/", function(err, res) {
                    res.isSubvolume("xyz", function(err, res) {
                        should.not.exist(err);
                        should.exist(res);
                        res.should.be.false;
                        done();
                    });
                });
            });
        });

        describe('.removeSubvolume()', function(){
            it('should not return an error when removing a subvolume', function(done){
                Btrfs("test/mnt/", function(err, res) {
                    res.removeSubvolume("mybackup", function(err, res) {
                        should.not.exist(err);
                        done();
                    });
                });
            });
        });

        describe('.removeSubvolume()', function(){
            it('should not return an error when removing a subvolume', function(done){
                Btrfs("test/mnt/", function(err, res) {
                    res.removeSubvolume("mybackup-snapshot", function(err, res) {
                        should.not.exist(err);
                        done();
                    });
                });
            });
        });

    });

    describe('.isBtrfs(path)', function(){
        it('should return error if path is not a btrfs', function(done){
            Btrfs("test/", function(err, res) {
                should.exist(err);
                done()
            });
        });
    
        it('should return no error if path is a btrfs', function(done){
            Btrfs("test/mnt/", function(err, res) {
                should.not.exist(err);
                done()
            });
        });
    });

    
}) 