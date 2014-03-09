var should = require("should");
var config = require("../lib/config");

describe('config', function(){
  describe('.load()', function(){
    it('should return error when file does not exist', function(done){
        config.load("/some/where.js", function(err, res) {
            should.exist(err);
            done();
        });
    });
  });
}) 
