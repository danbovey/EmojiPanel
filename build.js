var gulp = require('gulp');
var svgSprite = require('gulp-svg-sprite');
var spinner = require('char-spinner');

var ghdownload = require('github-download');
var twemoji = require('twemoji');
var fs = require('fs');
var _ = require('underscore');
var punycode = require('punycode');
var colors = require('colors');

var generateSprite = function() {
    console.log('Generating sprites with gulp'.inverse);
    console.log('--------------------');
    spinner();

    gulp.src('twemoji/2/svg/*.svg')
    .pipe(svgSprite({
        shape: {
            dimension: {
                maxWidth: 20,
                maxHeight: 20
            },
        },
        mode: {
            defs: {
                dest: '.',
                prefix: 'emoji-%s',
                sprite: 'img/emojis.svg',
                bust: false,
                example: true
            }
        }
    }))
    .pipe(gulp.dest('chrome'));
};

var downloaded = false;;
try {
    fs.statSync('twemoji')
    downloaded = true;
} catch(err) {
    //
}

console.log('Building emojis.json'.inverse);
console.log('--------------------');

var emojis = JSON.parse(fs.readFileSync('node_modules/emojilib/emojis.json'));
var emojisLength = 0;

var getHex = function(char) {
    return punycode
        .ucs2.decode(char) // Char -> UTF-16
        .map((char) => char.toString(16)) // UTF-16 -> HEX
        .filter((char) => char !== 'fe0f') // Filter \ufe0f
}

// Convert emoji characters to hex and add the URL
// Remove custom category & extras from the library
emojis = _.chain(emojis)
    .each(function(emoji) {
        if(emoji.char != null) {
            emoji.hex = getHex(emoji.char).join('-');
            emoji.url = twemoji.base + 'svg/' + emoji.hex + '.svg';
        }
    })
    .filter(function(emoji) {
        return emoji.category != '_custom' && emoji.hex.replace(/[^-]/g, "").length < 2;
    });

// Group by category
emojis = _.chain(emojis)
    .groupBy('category')
    .map(function(value, key) {
        emojisLength += Object.keys(value).length;

        return {
            name: key,
            emojis: value
        };
    });

fs.writeFileSync('chrome/emojis.json', JSON.stringify(emojis, null, 2));

console.log(('Built with ' + emojisLength + ' emojis!').green + ' 😍');
_.each(emojis._wrapped, function(value) {
    console.log('-- ' + Object.keys(value.emojis).length + '\t' + (value.emojis[0].char ? value.emojis[0].char : ' ') + '  ' + value.name);
});

if(downloaded == false) {
    console.log('Downloading twitter/twemoji repo'.inverse);
    console.log('--------------------');
    spinner();

    ghdownload({
            user: 'twitter',
            repo: 'twemoji',
            ref: 'gh-pages'
        }, 'twemoji')
        .on('zip', function(zipUrl) {
            // Github API limit was reached
            console.log(zipUrl);
        })
        .on('error', function(err) {
            console.error(err)
        })
        .on('end', function() {
            generateSprite();
        });
} else {
    generateSprite();
}