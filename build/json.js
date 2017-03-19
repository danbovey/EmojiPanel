const emojione = require('emojione');
const fs = require('fs');
const _ = require('underscore');

const categoryIcons = {
    people: {
        unicode: '1f642',
        char: '🙂'
    },
    objects: {
        unicode: '1f4a1',
        char: '💡'
    },
    activity: {
        unicode: '1f3c8',
        char: '🏈'
    },
    nature: {
        unicode: '1f33f',
        char: '🌿'
    },
    travel: {
        unicode: '2708',
        char: '✈'
    },
    symbols: {
        unicode: '2764',
        char: '❤'
    },
    food: {
        unicode: '1f354',
        char: '🍔'
    },
    flags: {
        unicode: '1f1e6-1f1f6',
        char: '🇦🇶'
    },
    alphabet: {
        unicode: '1f1e6',
        char: '🇦'
    }
};

module.exports = () => {
    console.log('Generating JSON file'.inverse.yellow);

    // Use the JSON list from EmojiOne
    let emojis = JSON.parse(fs.readFileSync('node_modules/emojione/emoji.json'));
    let emojisLength = 0;

    const modifierEmojis = [];
    const modifiers = ['1f3fb', '1f3fc', '1f3fd', '1f3fe', '1f3ff'];

    emojis = _.chain(emojis)
        .each((emoji, name) => {
            // Add `hex` for backwards compatability
            emoji.hex = emoji.unicode;
            // Add the Emoji character to each emoji object
            emoji.char = emojione.convert(emoji.unicode); // Convert the unicode sequence to 😍
            // Add the Emoji name to the keywords
            emoji.keywords.push(name);
        })
        .reject(emoji => {
            // Find emojis that use Fitzpatrick scale
            for(let m in modifiers) {
                const index = emoji.unicode.indexOf('-' + modifiers[m]);
                if(index > -1) {
                    // Find the main emoji and save to array
                    const firstCode = emoji.unicode.substring(0, index);
                    // If we haven't already added it to the array
                    if(modifierEmojis.indexOf(firstCode) == -1) {
                        const mainEmoji = _.find(emojis, (e) => e.unicode == firstCode);
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
        .each(emoji => {
            // Add `fitzpatrick` if it can be modified
            if(modifierEmojis.indexOf(emoji.unicode) > -1) {
                emoji.fitzpatrick = true;
            }
        })
        // Reject emojis that don't exist in the pack's asset folder
        // .reject(emoji => {
        //     try {
        //         fs.statSync(pack.findFile(emoji.unicode));
        //     } catch(err) {
        //         return true;
        //     }
        // })
        .sortBy(emoji => parseInt(emoji.emoji_order, 10)) // Sort by emoji order
        .groupBy('category') // Group by category
        .map((emojis, name) => { // Turn each category into { name, emojis }
            emojisLength += Object.keys(emojis).length;

            switch(name) {
                case 'regional':
                    // The alphabet group seems to get reversed
                    return {
                        name: 'alphabet',
                        emojis: emojis.reverse()
                    };
                default:
                    return {
                        name,
                        emojis
                    };
            }
        })
        .reject(category => typeof categoryIcons[category.name] == 'undefined')
        .each(category => category.icon = categoryIcons[category.name]);

    fs.writeFileSync('dist/emojis.json', JSON.stringify(emojis, null, 2));
    fs.writeFileSync('docs/emojis.json', JSON.stringify(emojis, null, 2));

    console.log(('JSON file has ' + emojisLength + ' emojis!').green + ' 😍');
    _.each(emojis._wrapped, category => {
        console.log('-- ' + Object.keys(category.emojis).length + '\t' + (category.emojis[0].char ? category.emojis[0].char : ' ') + '  ' + category.name);
    });
};
