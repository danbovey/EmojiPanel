const _ = require('underscore');

let options = {
    search: {
        enabled: true
    },
    frequent: {
        enabled: true,
        list: []
    },
    fitzpatrick: 'a'
};
let json = {};

const Storage = {
    load: () => {
        return new Promise((resolve) => {
            chrome.storage.sync.get(null, (items) => {
                _.extend(options, items);
                resolve(options);
            });
        });
    },
    save: (opts) => {
        return new Promise((resolve) => {
            chrome.storage.sync.set(opts, () => {
                options = opts;
                resolve();
            });
        });
    },
    get: () => {
        return options;
    },
    getJson: () => {
        return json;
    },
    setJson: (loadedJson) => {
        json = loadedJson;
    }
};

module.exports = Storage;
