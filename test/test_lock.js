var should = require("should");
var Lock = require("../lib/lock");

describe('lock(path)', function(){
    it('should return function if path does not exist', function(){
        var unlock = Lock("./test/data/mylock.lock");
        unlock.should.be.Function;
        
        var unlock2 = Lock("./test/data/mylock.lock");
        should.not.exist(unlock2);
        
        unlock();
        
    });

    
}) 