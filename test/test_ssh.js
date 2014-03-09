var should = require("should");
var ssh = require("../lib/ssh");

describe('ssh', function(){
    describe('.available(host)', function(){
    
        it('should return error if host unavailable', function(done){
            ssh.available("192.168.0.123", function (err, res) {
                should.exist(err);
                should(err.message).containEql("Timeout for host ");
                done();
            });
        
        });

        it('should return error if host does not listen on ssh', function(done){
            ssh.available("google.com", function (err, res) {
                should.exist(err);
                should(err.message).containEql("Timeout for host ");
                done();
            });
        
        });

        it('should return error if host does not exist', function(done){
            ssh.available("no.where", function (err, res) {
                should.exist(err);
                err.should.containEql("not found.");
                done();
            });
        
        });

        it('should return no error if host is available', function(done){
            ssh.available("192.168.0.2", function (err, res) {
                should.not.exist(err);
                done();
            });
        
        });
        
        
    });

    
}) 