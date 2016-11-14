const _ = require('underscore');

const Storage = require('./storage');
const Frequent = require('./frequent');

const Emojis = {
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
    createSVG: (emoji) => {
        return '<svg viewBox="0 0 20 20"><use xlink:href="#' + (emoji.unicode || emoji.hex) + '"></use></svg>';
        // const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        // svg.setAttribute('viewBox', '0 0 20 20');

        // const use = document.createElementNS('http://www.w3.org/2000/svg', 'use');
        // use.setAttribute('xlink:href', '#' + (emoji.unicode || emoji.hex));

        // svg.appendChild(use);

        // return svg;
    },
    createButton: (emoji) => {
        const options = Storage.get();

        const modifiers = {
            a: {
                unicode: '',
                char: ''
            },
            b: {
                unicode: '-1f3fb',
                char: '🏻'
            },
            c: {
                unicode: '-1f3fc',
                char: '🏼'
            },
            d: {
                unicode: '-1f3fd',
                char: '🏽'
            },
            e: {
                unicode: '-1f3fe',
                char: '🏾'
            },
            f: {
                unicode: '-1f3ff',
                char: '🏿'
            }
        };
        let unicode = (emoji.unicode || emoji.hex);
        let char = emoji.char;
        if(emoji.fitzpatrick) {
            unicode += modifiers[options.fitzpatrick].unicode;
            char += modifiers[options.fitzpatrick].char;
        }

        const button = document.createElement('button');
        button.setAttribute('type', 'button');
        button.innerHTML = Emojis.createSVG({ unicode });
        button.classList.add('emoji');
        button.dataset.unicode = unicode;
        button.dataset.char = char;
        button.dataset.category = emoji.category;
        if(emoji.fitzpatrick) {
            button.dataset.fitzpatrick = emoji.fitzpatrick;
        }

        return button;
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
                Frequent.add(emoji, Emojis.createButton);
            }
        }
    }
};

module.exports = Emojis;
