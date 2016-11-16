const _ = require('underscore');

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

const notifications = [
    {
        id: 1,
        message: '<strong>A Twitter update slightly broke me! <svg viewBox="0 0 20 20" width="20"><use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#1f631"></use></svg></strong><br>Twitter just rolled out an update to how they deal with emojis in their tweet form. Currently, all I can do is output emoji at the end of the tweet. A full fix is hopefully coming soon!'
    }
];

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
