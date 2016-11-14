const _ = require('underscore');

chrome.storage.sync.clear();

const Emojis = require('./emojis');
const Forms = require('./forms');
const Frequent = require('./frequent');
const Storage = require('./storage');

document.body.addEventListener('click', (e) => {
    // Click any .emoji button
    // The target could be svg or use element, or the button itself
    let el = e.target || e.srcElement;
    while(el && el.parentNode) {
        if(el.classList.contains('emoji')) {
            const emoji = {
                char: el.dataset.char,
                unicode: el.dataset.unicode,
                category: el.dataset.category
            };

            Emojis.write(emoji, el.parentNode);
            break;
        }
        el = el.parentNode;
    }

    // On click, close any dropdowns in condensed forms
    window.setTimeout(() => {
        const forms = document.querySelectorAll('.tweet-form');
        [].forEach.call(forms, function(form) {
            if(form.classList.contains('condensed')) {
                const dropdown = form.querySelector('.EmojiPanel-dropdown');
                if(dropdown) {
                    dropdown.classList.remove('open');
                    dropdown.querySelector('.btn').classList.remove('enabled');
                }
            }
        });
    }, 50);
});

// On pressing escape, always close any active dropdowns
document.body.addEventListener('keyup', (e) => {
    if(e.keyCode == 27) {
        const dropdowns = document.querySelectorAll('.EmojiPanel-dropdown');
        [].forEach.call(dropdowns, (dropdown) => {
            dropdown.classList.remove('open');
            dropdown.querySelector('.btn').classList.remove('enabled');
        });
    }
});

// Create new panels in every initial tweet form
Emojis.load()
    .then(() => {
        Storage.load()
            .then(() => {
                Forms.check();

                // Every second, check for any new tweet forms
                window.setInterval(() => {
                    Forms.check();
                }, 1000);
            });
    });

// Hide the DM emojibars
const emojiBars = document.querySelectorAll('.DMComposer-emojiBar');
[].forEach.call(emojiBars, (bar) => {
    bar.parentNode.removeChild(bar);
});
