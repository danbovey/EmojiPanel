var emojione = require('emojione');
var fs = require('fs');
var _ = require('underscore');

module.exports = function() {
    console.log('Building emojis.json'.inverse);
    console.log('--------------------');

    var emojis = JSON.parse(fs.readFileSync('node_modules/emojione/emoji.json'));
    var emojisLength = 0;

    emojis = _.chain(emojis)
        // Add `hex` for backwards compatability
        // Add the Emoji character to each emoji object
        // Add the Emoji name to the keywords
        .each(function(emoji, name) {
            emoji.hex = emoji.unicode;
            emoji.char = emojione.convert(emoji.unicode); // Convert the unicode sequence to 😍
            emoji.keywords.push(name);
        })
        .reject(function(emoji) {
            try {
                fs.statSync('twemoji/2/svg/' + emoji.unicode + '.svg');
            } catch(err) {
                return true;
            }
        })
        .sortBy(function(emoji) { return parseInt(emoji.emoji_order, 10); }) // Sort by emoji order
        .groupBy('category') // Group by category
        .map(function(value, key) { // Turn each category into { name, emojis }
            emojisLength += Object.keys(value).length;

            switch(key) {
                case 'regional':
                    // The alphabet group seems to get reversed
                    return {
                        name: 'alphabet',
                        emojis: value.reverse()
                    };
                default:
                    return {
                        name: key,
                        emojis: value
                    }
            }
        });

    fs.writeFileSync('chrome/emojis.json', JSON.stringify(emojis, null, 2));

    console.log(('Built with ' + emojisLength + ' emojis!').green + ' 😍');
    _.each(emojis._wrapped, function(value) {
        console.log('-- ' + Object.keys(value.emojis).length + '\t' + (value.emojis[0].char ? value.emojis[0].char : ' ') + '  ' + value.name);
    });
};
