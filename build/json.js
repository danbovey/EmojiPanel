var emojione = require('emojione');
var fs = require('fs');
var _ = require('underscore');

module.exports = ()  => {
    console.log('Building emojis.json'.inverse);
    console.log('--------------------');

    var emojis = JSON.parse(fs.readFileSync('node_modules/emojione/emoji.json'));
    var emojisLength = 0;

    var modifierEmojis = [];
    var modifiers = ['1f3fb', '1f3fc', '1f3fd', '1f3fe', '1f3ff'];

    emojis = _.chain(emojis)
        .each((emoji, name) => {
            // Add `hex` for backwards compatability
            emoji.hex = emoji.unicode;
            // Add the Emoji character to each emoji object
            emoji.char = emojione.convert(emoji.unicode); // Convert the unicode sequence to 😍
            // Add the Emoji name to the keywords
            emoji.keywords.push(name);
        })
        .reject((emoji) => {
            // Find emojis that use Fitzpatrick scale
            for(var m in modifiers) {
                var index = emoji.unicode.indexOf('-' + modifiers[m]);
                if(index > -1) {
                    // Find the main emoji and save to array
                    var firstCode = emoji.unicode.substring(0, index);
                    // If we haven't already added it to the array
                    if(modifierEmojis.indexOf(firstCode) == -1) {
                        var mainEmoji = _.find(emojis, (e) => e.unicode == firstCode);
                        if(mainEmoji) {
                            // TODO: Could push each scale number instead of assuming all 5 exist
                            modifierEmojis.push(mainEmoji.unicode);
                        }
                    }

                    // Remove this modifier emoji
                    return true;
                }
            }
        })
        .each((emoji) => {
            // Add `fitzpatrick` if it can be modified
            if(modifierEmojis.indexOf(emoji.unicode) > -1) {
                emoji.fitzpatrick = true;
            }
        })
        .reject((emoji) => {
            try {
                fs.statSync('twemoji/2/svg/' + emoji.unicode + '.svg');
            } catch(err) {
                return true;
            }
        })
        .sortBy(emoji => parseInt(emoji.emoji_order, 10)) // Sort by emoji order
        .groupBy('category') // Group by category
        .map((value, key) => { // Turn each category into { name, emojis }
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
        })
        .reject((value, key) => {
            // Remove the modifier category
            if(key == 'modifier') {
                return true;
            }
        });

    fs.writeFileSync('chrome/emojis.json', JSON.stringify(emojis, null, 2));

    console.log(('Built with ' + emojisLength + ' emojis!').green + ' 😍');
    _.each(emojis._wrapped, (value) => {
        console.log('-- ' + Object.keys(value.emojis).length + '\t' + (value.emojis[0].char ? value.emojis[0].char : ' ') + '  ' + value.name);
    });
};
