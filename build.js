var fs = require('fs');
var colors = require('colors');

var downloadTwemoji = require('./build/twemoji');
var buildJson = require('./build/json');
var generateSprite = require('./build/sprite');

var build = function() {
    buildJson();
    generateSprite();
};

// Download Twemoji repo or skip straight to build if it exists
try {
    fs.statSync('twemoji');
    build();
} catch(err) {
    if(err.code == 'ENOENT') {
        downloadTwemoji(build);
    } else {
        console.log(err);
    }
}
