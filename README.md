# NoGo
NoGo is a super simple rate limiter intended for human users. Requests exceeding the limit rate earn strikes, and enough strikes can result in being ignored (indefinitely or with cooldown). Configure instances of the rate limiter and provide callbacks for the "no" (rate exceeded) and "go" (request allowed) cases.

## Installation
```sh
npm install nogo
```

## Creation
Create a rate limiter instance by passing the module a configuration object:
```js
var rateLimit = require("nogo");

var limiter = rateLimit({
  rate: 0.3,
  burst: 2,
  strikes: 3,
  cooldown: 60
});
```

NoGo uses a basic token bucket implementation. To successfully make a request, there must be at least 1 complete token in the bucket.
* **rate** determines the refill rate in tokens per second. Once a bucket is full, it does not outgrow its capacity. Rate is set to 1 by default
* **burst** represents the capacity of the bucket. A burst greater than 1 means you can actually exceed the request rate until the bucket is empty. Burst is set to 1 by default.
* **strikes** is how many times a request is denied before the user is ignored. Strikes work like baseball--if strike is 3, then on their 3rd strike the user is "out". If this value is not provided (or is 0) then the concept of strikes will not be used
* **cooldown** is how long, in seconds, someone will be ignored after striking out. If not provided (or is 0), then the period will be indefinite (rather, until you restart the application). Making more requests in the cooldown period does not extend it

## Usage
Make requests by providing a key to represent the user and two callbacks: `no(strike)` and `go()`. All requests under the same key will be rate limited together, and separately from other keys, under the configuration the instance was created with. The callbacks are used in the case the request fails or succeeds, except `no(strike)` will not be called if the key is in cooldown.

Here's an example of using NoGo to rate limit an IRC bot message handler:
```js
var limiter = rateLimit({
  rate: 0.8,
  burst: 3,
  strikes: 3,
  cooldown: 60
});

bot.msg(/^!echo\s+(.+)$/i, function(nick, channel, match) {
  limiter(nick, {
    no: function(strike) {
      if (strike == 1) {
        bot.say nick, "Enhance your calm!";
      }
    },
    go: function() {
      bot.reply(nick, channel, match[1]);
    }
  });
});
```

## Alternatives
- [node-rate-limiter](https://github.com/jhurliman/node-rate-limiter)
- [node-ratelimiter](https://github.com/tj/node-ratelimiter)
- [node-simple-rate-limiter](https://github.com/xavi-/node-simple-rate-limiter)

## Running Tests
```sh
$ npm test
```

## License
[MIT](http://opensource.org/licenses/MIT)
