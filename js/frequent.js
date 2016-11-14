const _ = require('underscore');

const Emojis = require('./emojis');
const Storage = require('./storage');

const Frequent = {
    get: () => {
        const options = Storage.get();
        // Must be used at least times times, return the top 9
        return _.chain(options.frequent.list)
            .filter((e) => {
                return e.count > 9;
            })
            .first(9)
            .sortBy('unicode')
            .sortBy('count')
            ._wrapped.reverse();
    },
    add: (emoji) => {
        const options = Storage.get();
        let exists = false;
        options.frequent.list = _.map(options.frequent.list, (e) => {
            if((e.unicode || e.hex) == emoji.unicode) {
                e.count += 1;
                exists = true;
            }

            return e;
        });

        if(exists == false) {
            emoji.count = 1;
            options.frequent.list.push(emoji);
        }

        Frequent.sort(options); // Saves as well
    },
    sort: (options) => {
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
                    frequentResults.appendChild(Emojis.createButton(emoji));
                });
            });
        }

        Storage.save(options);
    }
};

module.exports = Frequent;
