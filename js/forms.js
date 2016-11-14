const _ = require('underscore');

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

                const icon = document.createElement('span');
                icon.classList.add('Icon', 'Icon--search');

                query.appendChild(input);
                query.appendChild(icon);
                content.appendChild(query);
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
                    const button = document.createElement('button');
                    button.setAttribute('type', 'button');
                    button.innerHTML = '<svg viewBox="0 0 20 20"><use xlink:href="#' + (emoji.unicode || emoji.hex) + '"></use></svg>';
                    button.classList.add('emoji');
                    button.dataset.unicode = (emoji.unicode || emoji.hex);
                    button.dataset.char = emoji.char;
                    button.dataset.category = emoji.category;

                    frequentResults.appendChild(button);
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

            // const order = ['people', 'animals_and_nature', 'food_and_drink', 'objects', 'activity', 'travel_and_places', 'symbols', 'flags'];
            _.each(json, (category) => {
                // const category = _.find(json, (category) => {
                //     return category.name == categoryName;
                // });

                // if(category) {
                    const title = document.createElement('p');
                    title.classList.add('category-title');
                    let categoryName = category.name.replace(/_/g, ' ');
                    categoryName = categoryName.replace(/\w\S*/g, (name) => {
                        return name.charAt(0).toUpperCase() + name.substr(1).toLowerCase();
                    });
                    categoryName = categoryName.replace('And', '&amp;');
                    title.innerHTML = categoryName;
                    results.appendChild(title);

                    const emojis = category.emojis;

                    _.each(emojis, (emoji) => {
                        const button = document.createElement('button');
                        button.setAttribute('type', 'button');
                        button.innerHTML = '<svg viewBox="0 0 20 20"><use xlink:href="#' + emoji.unicode + '"></use></svg>';
                        button.classList.add('emoji');
                        button.dataset.char = emoji.char;
                        button.dataset.unicode = emoji.unicode;
                        button.dataset.category = emoji.category;

                        results.appendChild(button);
                    });
                // }
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
