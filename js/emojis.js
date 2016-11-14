const Storage = require('./storage');
const Frequent = require('./frequent');

module.exports = {
    load: () => {
        // Load and inject the SVG sprite into the DOM
        const svgXhr = new XMLHttpRequest();
        svgXhr.open('GET', chrome.extension.getURL('img/emojis.svg'), true);
        svgXhr.onload = () => {
            const container = document.createElement('div');
            container.innerHTML = svgXhr.responseText;
            document.body.appendChild(container);
        };
        svgXhr.send();

        return new Promise((resolve) => {
            const emojiXhr = new XMLHttpRequest();
            emojiXhr.open('GET', chrome.extension.getURL('emojis.json'), true);
            emojiXhr.onreadystatechange = () => {
                if(emojiXhr.readyState == XMLHttpRequest.DONE && emojiXhr.status == 200) {
                    const json = JSON.parse(emojiXhr.responseText);

                    Storage.setJson(json);
                    resolve(json);
                }
            };
            emojiXhr.send();
        });
    },
    write: (emoji, el) => {
        const options = Storage.get();
        let input = null;
        while(el && el.parentNode) {
            el = el.parentNode;
            if(el.tagName && el.tagName.toLowerCase() == 'form') {
                input = el.querySelector('.tweet-box');
                break;
            }
        }

        if(input && input.isContentEditable) {
            // Insert the emoji at the end of the text by default
            let offset = input.textContent.length;
            if(input.dataset.offset) {
                // Insert the emoji where the rich editor caret was
                offset = input.dataset.offset;
            }

            input.textContent = input.textContent.substring(0, offset) + emoji.char + input.textContent.substring(offset, input.textContent.length);

            if(options.frequent.enabled == true) {
                Frequent.add(emoji, options);
            }
        }
    }
};
