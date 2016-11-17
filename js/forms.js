const _ = require('lodash');

const Emojis = require('./emojis');
const Frequent = require('./frequent');
const Storage = require('./storage');

const forms = {
    check: () => {
        const options = Storage.get();
        const json = Storage.getJson();

        const all = document.querySelectorAll('.tweet-form');
        [].forEach.call(all, (form) => {
            if(!form.classList.contains('EmojiPanel')) {
                forms.create(form, options, json);
            }
        });
    },
    create: (form, options, json) => {
        form.classList.add('EmojiPanel');

        const tweetBox = form.querySelector('.tweet-box');
        const handleChange = (e) => {
            tweetBox.dataset.offset = forms.getCaretPosition(tweetBox);
        };
        tweetBox.addEventListener('keyup', handleChange);
        tweetBox.addEventListener('change', handleChange);
        tweetBox.addEventListener('click', handleChange);

        const extras = form.querySelector('.tweet-box-extras');
        if(extras) {
            const extraItem = document.createElement('div');
            extraItem.classList.add('TweetBoxExtras-item');

            const dropdown = document.createElement('div');
            dropdown.classList.add('dropdown', 'EmojiPanel-dropdown');

            extraItem.appendChild(dropdown);

            const btn = document.createElement('button');
            btn.setAttribute('type', 'button');
            btn.classList.add('btn', 'icon-btn', 'js-tooltip');
            btn.dataset.delay = 150;
            btn.dataset.originalTitle = 'Add emoji';
            btn.style.opacity = 1;
            btn.setAttribute('aria-haspopup', false);

            const icon = document.createElement('span');
            icon.classList.add('Icon', 'Icon--smiley');

            let color = '#2F9AC2'; // Default Twitter color
            const otherIcon = form.querySelector('.TweetBoxExtras-item .Icon');
            if(otherIcon) {
                color = window.getComputedStyle(otherIcon).color
            }
            icon.style.color = color;
            btn.appendChild(icon);

            const tooltip = document.createElement('span');
            tooltip.classList.add('text', 'u-hiddenVisually');
            tooltip.innerHTML = 'Add emoji';
            btn.appendChild(tooltip);

            btn.addEventListener('click', () => {
                if(dropdown.classList.toggle('open')) {
                    btn.classList.add('enabled');
                    if(options.search.enabled) {
                        input.focus();
                    }
                } else {
                    btn.classList.remove('enabled');
                }
            });

            const dropdownMenu = document.createElement('div');
            dropdownMenu.classList.add('dropdown-menu', 'EmojiPanel-dropdownMenu');
            dropdownMenu.tabIndex = -1;

            const content = document.createElement('div');
            content.classList.add('Caret', 'Caret--stroked', 'Caret--top', 'EmojiPanel-content');
            dropdownMenu.appendChild(content);

            let input;
            if(options.search.enabled == true) {
                const query = document.createElement('div');
                query.classList.add('EmojiPanel-query');

                input = document.createElement('input');
                input.classList.add('EmojiPanel-queryInput');
                input.setAttribute('type', 'text');
                input.setAttribute('autoComplete', 'off');
                input.setAttribute('placeholder', 'Search');
                query.appendChild(input);

                const icon = document.createElement('span');
                icon.classList.add('Icon', 'Icon--search');
                query.appendChild(icon);

                const modifiers = {
                    a: '',
                    b: '-1f3fb',
                    c: '-1f3fc',
                    d: '-1f3fd',
                    e: '-1f3fe',
                    f: '-1f3ff'
                };
                const hand = '270b' + modifiers[options.fitzpatrick]; // ✋

                const modifierToggle = document.createElement('button');
                modifierToggle.setAttribute('type', 'button');
                modifierToggle.classList.add('EmojiPanel-btnModifier', 'EmojiPanel-btnModifierToggle');
                modifierToggle.innerHTML = Emojis.createSVG({unicode: hand});
                query.appendChild(modifierToggle);

                const modifierDropdown = document.createElement('div');
                modifierDropdown.classList.add('EmojiPanel-modifierDropdown');

                for(var m in modifiers) {
                    const modifier = modifiers[m];
                    const unicode = '270b' + modifier;
                    const modifierBtn = document.createElement('button');
                    modifierBtn.setAttribute('type', 'button');
                    modifierBtn.classList.add('EmojiPanel-btnModifier');
                    modifierBtn.dataset.modifier = m;
                    modifierBtn.innerHTML = Emojis.createSVG({ unicode });

                    modifierBtn.addEventListener('click', function(e) {
                        e.stopPropagation();
                        e.preventDefault();

                        const toggles = [].forEach.call(document.querySelectorAll('.EmojiPanel-btnModifierToggle'), (toggle) => {
                            toggle.innerHTML = Emojis.createSVG({ unicode });
                        });

                        const options = Storage.get();
                        options.fitzpatrick = this.dataset.modifier;
                        modifierDropdown.classList.remove('active');
                        Storage.save(options);

                        // Refresh every emoji in any list with new skin tone
                        const emojis = [].forEach.call(document.querySelectorAll('.EmojiPanel .emoji'), (emoji) => {
                            if(emoji.dataset.fitzpatrick) {
                                const emojiObj = {
                                    unicode: emoji.dataset.unicode,
                                    char: emoji.dataset.char,
                                    fitzpatrick: true,
                                    category: emoji.dataset.category,
                                    name: emoji.dataset.name
                                }
                                emoji.parentNode.replaceChild(Emojis.createButton(emojiObj), emoji);
                            }
                        });
                    });

                    modifierDropdown.appendChild(modifierBtn);
                }
                query.appendChild(modifierDropdown);

                modifierToggle.addEventListener('click', function() {
                    modifierDropdown.classList.toggle('active');
                });

                content.appendChild(query);
            }

            const notes = Storage.getNotifications();
            if(notes.length > 0) {
                const notifications = document.createElement('div');
                notifications.classList.add('EmojiPanel-notifications');
                for(var n in notes) {
                    const note = notes[n];
                    const notification = document.createElement('div');
                    notification.classList.add('EmojiPanel-note');
                    notification.innerHTML = note.message;

                    const noteCloser = document.createElement('button');
                    noteCloser.setAttribute('type', 'button');
                    noteCloser.classList.add('EmojiPanel-note-close');
                    noteCloser.innerHTML = 'X' + '<small>Don\'t show again</small>';
                    noteCloser.addEventListener('click', function() {
                        notifications.removeChild(notification);
                        const opts = Storage.get(options);
                        opts.notifications.push(note.id);
                        Storage.save(options);
                    });
                    notification.appendChild(noteCloser);

                    notifications.appendChild(notification);
                }

                content.appendChild(notifications);
            }

            const results = document.createElement('div');
            results.classList.add('EmojiPanel-results');
            results.style.height = '160px';

            if(options.frequent.enabled == true) {
                const frequentList = Frequent.get();
                const frequentTitle = document.createElement('p');
                frequentTitle.classList.add('category-title', 'EmojiPanel-frequentTitle');
                frequentTitle.innerHTML = 'Frequently used';
                if(frequentList.length == 0) {
                    frequentTitle.style.display = 'none';
                }
                results.appendChild(frequentTitle);

                const frequentResults = document.createElement('div');
                frequentResults.classList.add('EmojiPanel-frequent');

                _.each(frequentList, (emoji) => {
                    frequentResults.appendChild(Emojis.createButton(emoji));
                });
                results.appendChild(frequentResults);
            }

            let searchTitle;
            let emptyState;
            if(options.search.enabled == true) {
                searchTitle = document.createElement('p');
                searchTitle.classList.add('category-title');
                searchTitle.style.display = 'none';
                searchTitle.innerHTML = 'Search results';
                results.appendChild(searchTitle);

                emptyState = document.createElement('span');
                emptyState.classList.add('EmojiPanel-noResults');
                emptyState.innerHTML = 'No results.';
                results.appendChild(emptyState);
            }

            _.each(json, (category) => {
                const title = document.createElement('p');
                title.classList.add('category-title');

                let categoryName = category.name.replace(/_/g, ' ')
                    .replace(/\w\S*/g, (name) => name.charAt(0).toUpperCase() + name.substr(1).toLowerCase())
                    .replace('And', '&amp;');

                title.innerHTML = categoryName;
                results.appendChild(title);

                _.each(category.emojis, (emoji) => {
                    results.appendChild(Emojis.createButton(emoji));
                });
            });

            content.appendChild(results);
            dropdownMenu.appendChild(content);
            dropdown.appendChild(btn);
            dropdown.appendChild(dropdownMenu);
            extraItem.appendChild(dropdown);
            extras.appendChild(extraItem);

            if(options.search.enabled == true) {
                input.addEventListener('input', (e) => {
                    const matched = [];
                    const emojis = results.querySelectorAll('.emoji');
                    const titles = results.querySelectorAll('.category-title');
                    const noResults = results.querySelector('.EmojiPanel-noResults');

                    const value = e.target.value.replace(/-/g, '').toLowerCase();
                    if(value.length > 0) {
                        _.each(json, (category) => {
                            _.each(category.emojis, (emoji) => {
                                const keywordMatch = _.find(emoji.keywords, (keyword) => {
                                    keyword = keyword.replace(/-/g, '').toLowerCase();

                                    return keyword.indexOf(value) > -1;
                                });
                                
                                if(keywordMatch) {
                                    matched.push(emoji.unicode);
                                }
                            });
                        });

                        if(matched.length == 0) {
                            emptyState.style.display = 'block';

                        } else {
                            emptyState.style.display = 'none';
                        }

                        [].forEach.call(emojis, (emoji) => {
                            if(matched.indexOf(emoji.dataset.unicode) == -1) {
                                emoji.style.display = 'none';
                            } else {
                                emoji.style.display = 'inline-block';
                            }
                        });
                        [].forEach.call(titles, (title) => {
                            title.style.display = 'none';
                        });
                        searchTitle.style.display = 'block';

                        if(options.frequent.enabled == true) {
                            results.querySelector('.EmojiPanel-frequent').style.display = 'none';
                        }
                    } else {
                        [].forEach.call(emojis, (emoji) => {
                            emoji.style.display = 'inline-block';
                        });
                        [].forEach.call(titles, (title) => {
                            title.style.display = 'block';
                        });
                        searchTitle.style.display = 'none';
                        noResults.style.display = 'none';

                        if(options.frequent.enabled == true) {
                            results.querySelector('.EmojiPanel-frequent').style.display = 'block';
                        }
                    }
                });
            }
        }
    },
    getCaretPosition: (el) => {
        let caretOffset = 0;
        const doc = el.ownerDocument || el.document;
        const win = doc.defaultView || doc.parentWindow;
        let sel;
        if (typeof win.getSelection != "undefined") {
            sel = win.getSelection();
            if (sel.rangeCount > 0) {
                const range = win.getSelection().getRangeAt(0);
                const preCaretRange = range.cloneRange();
                preCaretRange.selectNodeContents(el);
                preCaretRange.setEnd(range.endContainer, range.endOffset);
                caretOffset = preCaretRange.toString().length;
            }
        } else if ( (sel = doc.selection) && sel.type != "Control") {
            const textRange = sel.createRange();
            const preCaretTextRange = doc.body.createTextRange();
            preCaretTextRange.moveToElementText(el);
            preCaretTextRange.setEndPoint("EndToEnd", textRange);
            caretOffset = preCaretTextRange.text.length;
        }
        
        return caretOffset;
    }
};

module.exports = forms;
