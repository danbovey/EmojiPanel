var twemoji = require('twemoji');
var fs = require('fs');
var _ = require('underscore');
var punycode = require('punycode');
var colors = require('colors');

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

emojis = _.chain(emojis)
    .filter(function(emoji) {
        return emoji.category != '_custom';
    })
    .each(function(emoji) {
        if(emoji.char != null) {
            emoji.hex = getHex(emoji.char).join('-');
            emoji.url = twemoji.base + 'svg/' + emoji.hex + '.svg';
        }
    });

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