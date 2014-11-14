var rateLimit = require("..");
var async = require("async");
var assert = require("assert");

describe("limiter", function() {
  it("should start with a full bucket", function(done) {
    var limiter = rateLimit({
      rate: 0.5
    });

    limiter("key", {
      go: function() {
        done();
      },
      no: function() {}
    });
  });

  it("should allow bursts", function(done) {
    var limiter = rateLimit({
      rate: 0.1,
      burst: 2
    });

    async.series([
      function(cb) {
        limiter("key", {
          no: function(strike) {},
          go: function() {
            cb();
          }
        });
      },
      function(cb) {
        limiter("key", {
          no: function(strike) {},
          go: function() {
            cb();
          }
        });
      }
    ], function(err, results) {
      assert.equal(err, null);
      done();
    });
  });

  it("should limit rate and refill", function(done) {
    var limiter = rateLimit({
      rate: 1
    });

    async.series([
      function(cb) {
        limiter("key", {
          go: function() {
            cb();
          },
          no: function(strike) {}
        });
      },
      function(cb) {
        limiter("key", {
          go: function() {},
          no: function(strike) {
            assert.equal(strike, 1);
            cb();
          }
        });
      },
      function(cb) {
        setTimeout(function() {
          limiter("key", {
            go: function() {
              cb();
            },
            no: function(strike) {}
          });
        }, 1000);
      }
    ], function(err, results) {
      assert.equal(err, null);
      done();
    });
  });

  it("should handle keys independently", function(done) {
    var limiter = rateLimit({
      rate: 0.1
    });

    async.series([
      function(cb) {
        limiter("key", {
          go: function() {
            cb();
          },
          no: function(strike) {}
        });
      },
      function(cb) {
        limiter("key", {
          go: function() {},
          no: function(strike) {
            cb();
          }
        });
      },
      function(cb) {
        limiter("alternate key", {
          go: function() {
            cb();
          },
          no: function(strike) {}
        });
      }
    ], function(err, results) {
      assert.equal(err, null);
      done();
    });
  });

  it("should cooldown after too many strikes", function(done) {
    limiter = rateLimit({
      strikes: 1,
      cooldown: 1
    });

    async.series([
      function(cb) {
        limiter("key", {
          no: function(strike) {},
          go: function() {
            cb();
          }
        });
      },
      function(cb) {
        limiter("key", {
          no: function(strike) {
            cb();
          },
          go: function() {}
        });
      },
      function(cb) {
        limiter("key", {
          no: function(strike) {
            assert(false, "Struck out keys should be ingored");
          },
          go: function() {
            assert(false, "Struck out keys should not Go");
          }
        });
        cb();
      },
      function(cb) {
        setTimeout(function() {
          limiter("key", {
            go: function() {
              cb();
            },
            no: function(strike) {}
          });
        }, 1000);
      }
    ], function(err, results) {
      assert.equal(err, null);
      done();
    });
  });
});