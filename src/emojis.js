const modifiers = require('./modifiers');

const Emojis = {
    load: options => {
        // Load and inject the SVG sprite into the DOM
        let svgPromise = Promise.resolve();
        if(options.pack_url && !document.querySelector('EmojiPanel__svg')) {
            svgPromise = new Promise(resolve => {
                const svgXhr = new XMLHttpRequest();
                svgXhr.open('GET', options.pack_url, true);
                svgXhr.onload = () => {
                    const container = document.createElement('div');
                    container.classList.add('EmojiPanel__svg');
                    container.style.display = 'none';
                    container.innerHTML = svgXhr.responseText;
                    document.body.appendChild(container);
                    resolve();
                };
                svgXhr.send();
            });
        }

        // Load the emojis json
        const json = localStorage.getItem('EmojiPanel-json');
        let jsonPromise = Promise.resolve(json);
        if(json == null) {
            jsonPromise = new Promise(resolve => {
                const emojiXhr = new XMLHttpRequest();
                emojiXhr.open('GET', options.json_url, true);
                emojiXhr.onreadystatechange = () => {
                    if(emojiXhr.readyState == XMLHttpRequest.DONE && emojiXhr.status == 200) {
                        const json = JSON.parse(emojiXhr.responseText);
                        resolve(json);
                    }
                };
                emojiXhr.send();
            });
        }

        return Promise.all([ svgPromise, jsonPromise ]);
    },
    createEl: (emoji, options) => {
        if(options.pack_url) {
            if(document.querySelector(`.EmojiPanel__svg [id="${emoji.unicode}"`)) {
                return `<svg viewBox="0 0 20 20"><use xlink:href="#${emoji.unicode}"></use></svg>`;
            }
        }

        // Fallback to the emoji char if the pack does not have the sprite, or no pack
        return emoji.char;
    },
    createButton: (emoji, options) => {
        let unicode = emoji.unicode;
        let char = emoji.char;
        if(emoji.fitzpatrick) {
            // Remove existing modifiers
            Object.keys(modifiers).forEach(m => unicode = unicode.replace(m.unicode, ''));
            Object.keys(modifiers).forEach(m => char = char.replace(m.char, ''));

            // Append fitzpatrick modifier
            unicode += modifiers[options.fitzpatrick].unicode;
            char += modifiers[options.fitzpatrick].char;
        }

        const button = document.createElement('button');
        button.setAttribute('type', 'button');
        button.innerHTML = Emojis.createEl(emoji, options);
        button.classList.add('emoji');
        button.dataset.unicode = unicode;
        button.dataset.char = char;
        button.dataset.category = emoji.category;
        button.dataset.name = emoji.name;
        if(emoji.fitzpatrick) {
            button.dataset.fitzpatrick = emoji.fitzpatrick;
        }

        return button;
    },
    write: (emoji, options) => {
        const input = options.editable;
        if(!input) {
            return;
        }

        // Insert the emoji at the end of the text by default
        let offset = input.textContent.length;
        if(input.dataset.offset) {
            // Insert the emoji where the rich editor caret was
            offset = input.dataset.offset;
        }

        // Insert the pictographImage
        const pictographs = input.parentNode.querySelector('.EmojiPanel__pictographs');
        const url = 'https://abs.twimg.com/emoji/v2/72x72/' + emoji.unicode + '.png';
        const image = document.createElement('img');
        image.classList.add('RichEditor-pictographImage');
        image.setAttribute('src', url);
        image.setAttribute('draggable', false);
        pictographs.appendChild(image);

        const span = document.createElement('span');
        span.classList.add('EmojiPanel__pictographText');
        span.setAttribute('title', emoji.name);
        span.setAttribute('aria-label', emoji.name);
        span.dataset.pictographText = emoji.char;
        span.dataset.pictographImage = url;
        span.innerHTML = '&emsp;';

        // If it's empty, remove the default content of the input
        const div = input.querySelector('div');
        if(div.innerHTML == '<br>') {
            div.innerHTML = '';
        }

        // Replace each pictograph span with it's native character
        const picts = div.querySelectorAll('.EmojiPanel__pictographText');
        [].forEach.call(picts, pict => {
            div.replaceChild(document.createTextNode(pict.dataset.pictographText), pict);
        });

        // Split content into array, insert emoji at offset index
        let content = emojiAware.split(div.textContent);
        content.splice(offset, 0, emoji.char);
        content = content.join('');
        
        div.textContent = content;

        // Trigger a refresh of the input
        const event = document.createEvent('HTMLEvents');
        event.initEvent('mousedown', false, true);
        input.dispatchEvent(event);

        // Update the offset to after the inserted emoji
        input.dataset.offset = parseInt(input.dataset.offset, 10) + 1;

        if(options.frequent.enabled == true) {
            Frequent.add(emoji, Emojis.createButton);
        }
    }
};

module.exports = Emojis;
