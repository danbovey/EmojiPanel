var options = {};
var defaults = {
    search: {
        enabled: true
    },
    frequent: {
        enabled: true,
        list: []
    }
};

var search = document.getElementById('search');
var frequent = document.getElementById('frequent');
var frequentCount = document.getElementById('frequent-count');
var btnClearFrequent = document.getElementById('btn-clear-frequent');

var btnSave = document.getElementById('save');
var status = document.getElementById('status');

var save_options = function() {
    chrome.storage.sync.set(options, function() {
        // Update status to let user know options were saved.
        status.textContent = 'Options saved.';
        setTimeout(function() {
            status.textContent = '';
        }, 750);
    });
};

// Load/reset options with defaults
var restore_options = function() {
    chrome.storage.sync.get(defaults, function(items) {
        options = items;
        search.checked = items.search.enabled;
        frequent.checked = items.frequent.enabled;
        frequentCount.textContent = items.frequent.list.length;

        console.log(items);
    });
};

document.addEventListener('DOMContentLoaded', restore_options);

btnSave.addEventListener('click', function() {
    options.search.enabled = search.checked;
    options.frequent.enabled = frequent.checked;

    save_options();
});

btnClearFrequent.addEventListener('click', function() {
    options.frequent.list = [];
    frequentCount.textContent = 0;

    save_options();
});
