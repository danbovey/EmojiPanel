const _ = require('lodash/core');
const reject = require('lodash/reject');

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

const notifications = [];

const Storage = {
    load: () => {
        return new Promise((resolve) => {
            chrome.storage.sync.get(null, (items) => {
                Object.assign(options, items);
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
        return reject(notifications, (note) => options.notifications.indexOf(note.id) > -1);
    }
};

module.exports = Storage;
