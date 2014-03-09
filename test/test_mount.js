var should = require("should");
var mount = require("../lib/mount");

// Note: Some test need root privileges

describe('mount', function(){
    describe('.isMountPoint(path)', function(){
        it('should return error if path is not a mount point', function(done){
            mount.isMountPoint("/to/nowwhere", function(err, res) {
                should.not.exist(err);
                should.exist(res);
                res.should.be.false;
                done()
            });
        });

        it('should return no error if path is a mount point', function(done){
            mount.isMountPoint("/", function(err, res) {
                should.not.exist(err);
                should.exist(res);
                res.should.be.true;
                done()
            });
        });
    });
    
    describe('.remount(path, readwrite)', function(){
        it('should return error if path canot be remounted', function(done){
            mount.remount("test/", true, function(err, res) {
                should.exist(err);
                done()
            });
        });

        it('should return no if path can be remounted', function(done){
            mount.remount("test/mnt/", true, function(err, res) {
                should.not.exist(err);
                done()
            });
        });

        it('should return no if readwrite parameter is omitted and path can be remounted', function(done){
            mount.remount("test/mnt/", function(err, res) {
                should.not.exist(err);
                done()
            });
        });
    });
}) 