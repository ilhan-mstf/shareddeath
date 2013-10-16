var express = require('express')
  , app = express()
  , server = require('http').createServer(app)
  , io = require('socket.io').listen(server)
  , Twit = require('twit');

io.set('log level', 1);

// New call to compress content
app.use(express.compress());

// Routing
app.use(express.static(__dirname), { maxAge: 86400000 });

// Start server
server.listen(8080);

// Twitter OAuth
var T_en = new Twit({
    consumer_key:         '_your_consumer_key_'
  , consumer_secret:      '_your_consumer_secret_'
  , access_token:         '_your_access_token_'
  , access_token_secret:  '_your_access_secret_'
});
var T_tr = new Twit({
    consumer_key:         '_your_consumer_key_'
  , consumer_secret:      '_your_consumer_secret_'
  , access_token:         '_your_access_token_'
  , access_token_secret:  '_your_access_secret_'
});

// Filter twitter public stream by the word.
var stream_en = T_en.stream('statuses/filter', { track: '#death,death,dying' });
var stream_tr = T_tr.stream('statuses/filter', { track: '#ölüm,ölüm,ölü,ölüyorum,öleceğim,öldüreceğim,geber,geberiyorum' });

// Start streaming
stream_en.on('tweet', function (tweet) {
    // Filter tweets that contain link
    if (!tweet.text.match(/http/) && !tweet.text.match(/@/)) {
        // Send tweets to the client
        io.sockets.volatile.emit('tweet_en', {
            user: tweet.user.screen_name
          , text: tweet.text
        });
    }
});

stream_tr.on('tweet', function (tweet) {
    // Filter tweets that contain link
    if (!tweet.text.match(/http/)) {
        // Send tweets to the client
        io.sockets.volatile.emit('tweet_tr', {
            user: tweet.user.screen_name
          , text: tweet.text
        });
    }
});

var connectCounter = 0
  , streamStarted = true;

io.sockets.on('connection', function (socket) {
    if (!connectCounter & !streamStarted) {
        stream_en.start();
        stream_tr.start();
        console.log("streams started.");
    }
    connectCounter++;

    socket.on('disconnect', function() { 
        connectCounter--; 
        if (!connectCounter) {
            stream_en.stop();
            stream_tr.stop();
            streamStarted = false;
            console.log("streams stoped.");
        }
    });
});
