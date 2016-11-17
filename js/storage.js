const _ = require('lodash');

let options = {
    search: {
        enabled: true
    },
    frequent: {
        enabled: true,
        list: []
    },
    fitzpatrick: 'a',
    notifications: []
};
let json = {};

const notifications = [{
    id: 2,
    message: '<strong>99% working</strong><br>Everything is back to normal. The only bug remaining is support for more than one skin tone emoji at once. It should be fixed soon <svg viewBox="0 0 20 20" width="20"><use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#1f44d"></use></svg>.'
}];

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
    },
    getNotifications: () => {
        const options = Storage.get();
        return _.reject(notifications, (note) => options.notifications.indexOf(note.id) > -1);
    }
};

module.exports = Storage;
