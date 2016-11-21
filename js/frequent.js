const _ = require('lodash/core');

const Storage = require('./storage');

const Frequent = {
    get: () => {
        const options = Storage.get();
        // Must be used at least 10 times, return the top 9
        return _.chain(options.frequent.list)
            .filter((e) => {
                return e.count >= 10;
            })
            .slice(0, 9)
            .sortBy('unicode')
            .sortBy('count')
            .reverse()
            .value();
    },
    add: (emoji, createButtonFn) => {
        const options = Storage.get();
        let exists = false;

        const allFrequent = _.map(options.frequent.list, (e) => {
            if((e.unicode || e.hex) == emoji.unicode) {
                e.count += 1;
                exists = true;
            }

            return e;
        });

        if(exists == false) {
            emoji.count = 1;
            allFrequent.push(emoji);
        }

        options.frequent.list = allFrequent;
        Storage.save(options);

        const frequentList = Frequent.get();
        if(frequentList.length > 0) {
            const frequentTitles = document.querySelectorAll('.EmojiPanel-frequentTitle');
            [].forEach.call(frequentTitles, function(title) {
                title.style.display = 'block';
            });

            const allFrequentResults = document.querySelectorAll('.EmojiPanel-frequent');
            [].forEach.call(allFrequentResults, (frequentResults) => {
                // Empty the frequently used group
                while(frequentResults.firstChild) {
                    frequentResults.removeChild(frequentResults.firstChild);
                }

                // Add the new sorted frequently used list
                _.each(frequentList, (emoji) => {
                    // Compatability with older storage schema
                    if(typeof emoji.unicode == 'undefined') {
                        emoji.unicode = emoji.hex
                    }
                    frequentResults.appendChild(createButtonFn(emoji));
                });
            });
        }
    }
};

module.exports = Frequent;
