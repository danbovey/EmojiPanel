var _ = require('underscore');

var EmojiPanel = {
    options: {
        search: {
            enabled: true
        },
        frequent: {
            enabled: true,
            list: []
        }
    },
    json: {},
    loadEmojis: function(callback) {
        var self = this;

        // Load and inject the SVG sprite into the DOM
        var svgXhr = new XMLHttpRequest();
        svgXhr.open('GET', chrome.extension.getURL('img/emojis.svg'), true); // 'https://s3-eu-west-1.amazonaws.com/emojipanel/emojis.svg'
        svgXhr.onload = function() {
            var container = document.createElement('div');
            container.innerHTML = svgXhr.responseText;
            document.body.appendChild(container);
        };
        svgXhr.send();

        var emojiXhr = new XMLHttpRequest();
        emojiXhr.open('GET', chrome.extension.getURL('emojis.json'), true);
        emojiXhr.onreadystatechange = function() {
            if(emojiXhr.readyState == XMLHttpRequest.DONE && emojiXhr.status == 200) {
                self.json = JSON.parse(emojiXhr.responseText);
                callback();
            }
        };
        emojiXhr.send();
    },
    writeEmoji: function(emoji, el) {
        var input = null;
        while(el && el.parentNode) {
            el = el.parentNode;
            if(el.tagName && el.tagName.toLowerCase() == 'form') {
                input = el.querySelector('.tweet-box');
                break;
            }
        }

        if(input && input.isContentEditable) {
            // Insert the emoji at the end of the text by default
            offset = input.textContent.length;
            if(input.dataset.offset) {
                // Insert the emoji where the rich editor caret was
                offset = input.dataset.offset;
            }

            input.textContent = input.textContent.substring(0, offset) + emoji.char + input.textContent.substring(offset, input.textContent.length);

            if(this.options.frequent.enabled == true) {
                this.addFrequent(emoji);
            }
        }
    },
    loadStorage: function(callback) {
        var self = this;

        chrome.storage.sync.get(null, function(items) {
            _.extend(self.options, items);
            callback();
        })
    },
    saveStorage: function(callback) {
        chrome.storage.sync.set(this.options, function() {
            if(typeof callback == 'function') {
                callback();
            }
        });
    },
    addFrequent: function(emoji) {
        var self = this;

        var exists = false;
        this.options.frequent.list = _.map(this.options.frequent.list, function(e) {
            if(e.hex == emoji.hex) {
                e.count += 1;
                exists = true;
            }

            return e;
        });

        if(exists == false) {
            if(this.options.frequent.list.length == 0) {
                // The list is empty, so bring in the title
                var frequentTitles = document.querySelectorAll('.EmojiPanel-frequentTitle');
                [].forEach.call(frequentTitles, function(title) {
                    title.style.display = 'block';
                });
            }

            emoji.count = 1;
            this.options.frequent.list.push(emoji);
        }

        this.saveStorage(function() {
            self.sortFrequent();
        });
    },
    sortFrequent: function() {
        var self = this;

        this.options.frequent.list = _.chain(this.options.frequent.list)
            .sortBy('hex')
            .sortBy('count');
        this.options.frequent.list = this.options.frequent.list._wrapped.reverse();

        var allFrequentResults = document.querySelectorAll('.EmojiPanel-frequent');
        [].forEach.call(allFrequentResults, function(frequentResults) {
            // Empty the frequently used group
            while(frequentResults.firstChild) {
                frequentResults.removeChild(frequentResults.firstChild);
            }
            // Add the new sorted frequently used list
            var top = _.filter(self.options.frequent.list, function(e) {
                return e.count > 9;
            });
            top = _.first(self.options.frequent.list, 9);
            _.each(top, function(emoji) {
                var button = document.createElement('button');
                button.setAttribute('type', 'button');
                button.innerHTML = '<svg viewBox="0 0 20 20"><use xlink:href="#' + emoji.hex + '"></use></svg>';
                button.classList.add('emoji');
                button.dataset.hex = emoji.hex;
                button.dataset.char = emoji.char;
                button.dataset.category = emoji.category;

                frequentResults.appendChild(button);
            });
        });
    },
    getCaretPosition: function(el) {
        var caretOffset = 0;
        var doc = el.ownerDocument || el.document;
        var win = doc.defaultView || doc.parentWindow;
        var sel;
        if (typeof win.getSelection != "undefined") {
            sel = win.getSelection();
            if (sel.rangeCount > 0) {
                var range = win.getSelection().getRangeAt(0);
                var preCaretRange = range.cloneRange();
                preCaretRange.selectNodeContents(el);
                preCaretRange.setEnd(range.endContainer, range.endOffset);
                caretOffset = preCaretRange.toString().length;
            }
        } else if ( (sel = doc.selection) && sel.type != "Control") {
            var textRange = sel.createRange();
            var preCaretTextRange = doc.body.createTextRange();
            preCaretTextRange.moveToElementText(el);
            preCaretTextRange.setEndPoint("EndToEnd", textRange);
            caretOffset = preCaretTextRange.text.length;
        }
        
        return caretOffset;
    },
    init: function() {
        var self = this;

        // Listen for the click of an emoji button
        document.body.addEventListener('click', function(e) {
            var found = false;

            // The target could be svg or use element, or the button itself
            var el = e.target;
            while(el && el.parentNode) {
                if(el.classList.contains('emoji')) {
                    found = true;
                    break;
                }
                el = el.parentNode;
            }

            if(found == true) {
                var emoji = {
                    char: el.dataset.char,
                    hex: el.dataset.hex,
                    category: el.dataset.category
                };

                self.writeEmoji(emoji, el.parentNode);
            }
        });

        // On pressing escape, always close any active dropdowns
        document.body.addEventListener('keyup', function(e) {
            if(e.keyCode == 27) {
                var dropdowns = document.querySelectorAll('.EmojiPanel-dropdown');
                [].forEach.call(dropdowns, function(dropdown) {
                    dropdown.classList.remove('open');
                    dropdown.querySelector('.btn').classList.remove('enabled');
                });
            }
        });

        // On click, close any dropdowns in condensed forms
        document.addEventListener('click', function() {
            window.setTimeout(function() {
                var forms = document.querySelectorAll('.tweet-form');
                [].forEach.call(forms, function(form) {
                    if(form.classList.contains('condensed')) {
                        var dropdown = form.querySelector('.EmojiPanel-dropdown');
                        if(dropdown) {
                            dropdown.classList.remove('open');
                            dropdown.querySelector('.btn').classList.remove('enabled');
                        }
                    }
                });
            }, 50);
        });
        
        this.loadEmojis(function() {
            self.loadStorage(function() {
                var forms = document.querySelectorAll('.tweet-form');
                if(forms.length > 0) {
                    [].forEach.call(forms, function(form) {
                        form.classList.add('EmojiPanel');

                        var tweetBox = form.querySelector('.tweet-box');
                        var handleChange = function(e) {
                            tweetBox.dataset.offset = self.getCaretPosition(tweetBox);
                        };
                        tweetBox.addEventListener('keyup', handleChange);
                        tweetBox.addEventListener('change', handleChange);
                        tweetBox.addEventListener('click', handleChange);

                        var extras = form.querySelector('.tweet-box-extras');
                        if(extras) {
                            var extraItem = document.createElement('div');
                            extraItem.classList.add('TweetBoxExtras-item');

                            var dropdown = document.createElement('div');
                            dropdown.classList.add('dropdown', 'EmojiPanel-dropdown');

                            extraItem.appendChild(dropdown);

                            var btn = document.createElement('button');
                            btn.setAttribute('type', 'button');
                            btn.classList.add('btn', 'icon-btn', 'js-tooltip');
                            btn.dataset.delay = 150;
                            btn.dataset.originalTitle = 'Add emoji';
                            btn.style.opacity = 1;
                            btn.setAttribute('aria-haspopup', false);

                            var icon = document.createElement('span');
                            icon.classList.add('Icon', 'Icon--smiley');
                            icon.style.color = window.getComputedStyle(document.querySelector('.TweetBoxExtras-item .Icon')).color;
                            btn.appendChild(icon);

                            var tooltip = document.createElement('span');
                            tooltip.classList.add('text', 'u-hiddenVisually');
                            tooltip.innerHTML = 'Add emoji';
                            btn.appendChild(tooltip);

                            btn.addEventListener('click', function() {
                                if(dropdown.classList.toggle('open')) {
                                    btn.classList.add('enabled');
                                    if(self.options.search.enabled) {
                                        input.focus();
                                    }
                                } else {
                                    btn.classList.remove('enabled');
                                }
                            });

                            var dropdownMenu = document.createElement('div');
                            dropdownMenu.classList.add('dropdown-menu', 'EmojiPanel-dropdownMenu');
                            dropdownMenu.tabIndex = -1;

                            var content = document.createElement('div');
                            content.classList.add('Caret', 'Caret--stroked', 'Caret--top', 'EmojiPanel-content');
                            dropdownMenu.appendChild(content);

                            if(self.options.search.enabled == true) {
                                var query = document.createElement('div');
                                query.classList.add('EmojiPanel-query');

                                var input = document.createElement('input');
                                input.classList.add('EmojiPanel-queryInput');
                                input.setAttribute('type', 'text');
                                input.setAttribute('autoComplete', 'off');
                                input.setAttribute('placeholder', 'Search');

                                var icon = document.createElement('span');
                                icon.classList.add('Icon', 'Icon--search');

                                query.appendChild(input);
                                query.appendChild(icon);
                                content.appendChild(query);
                            }

                            var results = document.createElement('div');
                            results.classList.add('EmojiPanel-results');
                            results.style.height = '160px';

                            if(self.options.frequent.enabled == true) {
                                var frequentTitle = document.createElement('p');
                                frequentTitle.classList.add('category-title', 'EmojiPanel-frequentTitle');
                                frequentTitle.innerHTML = 'Frequently used';
                                if(self.options.frequent.list.length == 0) {
                                    frequentTitle.style.display = 'none';
                                }
                                results.appendChild(frequentTitle);

                                var frequentResults = document.createElement('div');
                                frequentResults.classList.add('EmojiPanel-frequent');

                                var top = _.filter(self.options.frequent.list, function(e) {
                                    return e.count > 9;
                                });
                                top = _.first(self.options.frequent.list, 9);
                                _.each(top, function(emoji) {
                                    var button = document.createElement('button');
                                    button.setAttribute('type', 'button');
                                    button.innerHTML = '<svg viewBox="0 0 20 20"><use xlink:href="#' + emoji.hex + '"></use></svg>';
                                    button.classList.add('emoji');
                                    button.dataset.hex = emoji.hex;
                                    button.dataset.char = emoji.char;
                                    button.dataset.category = emoji.category;

                                    frequentResults.appendChild(button);
                                });
                                results.appendChild(frequentResults);
                            }

                            if(self.options.search.enabled == true) {
                                var searchTitle = document.createElement('p');
                                searchTitle.classList.add('category-title');
                                searchTitle.style.display = 'none';
                                searchTitle.innerHTML = 'Search results';
                                results.appendChild(searchTitle);

                                var emptyState = document.createElement('span');
                                emptyState.classList.add('EmojiPanel-noResults');
                                emptyState.innerHTML = 'No results.';
                                results.appendChild(emptyState);
                            }

                            var order = ['people', 'animals_and_nature', 'food_and_drink', 'objects', 'activity', 'travel_and_places', 'symbols', 'flags'];
                            _.each(order, function(categoryName) {
                                var category = _.find(self.json, function(category) {
                                    return category.name == categoryName;
                                });

                                if(category) {
                                    var title = document.createElement('p');
                                    title.classList.add('category-title');
                                    var categoryName = category.name.replace(/_/g, ' ');
                                    categoryName = categoryName.replace(/\w\S*/g, function(name) {
                                        return name.charAt(0).toUpperCase() + name.substr(1).toLowerCase();
                                    });
                                    categoryName = categoryName.replace('And', '&amp;');
                                    title.innerHTML = categoryName;
                                    results.appendChild(title);

                                    var emojis = category.emojis;

                                    _.each(emojis, function(emoji) {
                                        var button = document.createElement('button');
                                        button.setAttribute('type', 'button');
                                        button.innerHTML = '<svg viewBox="0 0 20 20"><use xlink:href="#' + emoji.hex + '"></use></svg>';
                                        button.classList.add('emoji');
                                        button.dataset.char = emoji.char;
                                        button.dataset.hex = emoji.hex;
                                        button.dataset.category = emoji.category;

                                        results.appendChild(button);
                                    });
                                }
                            });

                            content.appendChild(results);
                            dropdownMenu.appendChild(content);
                            dropdown.appendChild(btn);
                            dropdown.appendChild(dropdownMenu);
                            extraItem.appendChild(dropdown);
                            extras.appendChild(extraItem);

                            if(self.options.search.enabled == true) {
                                input.addEventListener('input', function(e) {
                                    var matched = [];
                                    var emojis = results.querySelectorAll('.emoji');
                                    var titles = results.querySelectorAll('.category-title');

                                    var value = e.target.value;
                                    value = value.replace(/-/g, '').toLowerCase();
                                    if(value.length > 0) {
                                        _.each(self.json, function(category) {
                                            _.each(category.emojis, function(emoji) {
                                                var matched = _.find(emoji.keywords, function(keyword) {
                                                    keyword = keyword.replace(/-/g, '').toLowerCase();

                                                    return keyword.indexOf(value) > -1;
                                                });
                                                
                                                if(matched) {
                                                    matched.push(emoji.hex);
                                                }
                                            });
                                        });

                                        if(matched.length == 0) {
                                            emptyState.style.display = 'block';

                                        } else {
                                            emptyState.style.display = 'none';
                                        }

                                        [].forEach.call(emojis, function(emoji) {
                                            if(matched.indexOf(emoji.dataset.hex) == -1) {
                                                emoji.style.display = 'none';
                                            } else {
                                                emoji.style.display = 'inline-block';
                                            }
                                        });
                                        [].forEach.call(titles, function(title) {
                                            title.style.display = 'none';
                                        });
                                        searchTitle.style.display = 'block';
                                    } else {
                                        [].forEach.call(emojis, function(emoji) {
                                            emoji.style.display = 'inline-block';
                                        });
                                        [].forEach.call(titles, function(title) {
                                            title.style.display = 'block';
                                        });
                                        searchTitle.style.display = 'none';
                                    }
                                });
                            }
                        }
                    });
                }
            });
        });

        // Hide the DM emojibars
        var emojiBars = document.querySelectorAll('.DMComposer-emojiBar');
        [].forEach.call(emojiBars, function(bar) {
            bar.parentNode.removeChild(bar);
        });
    }
};

EmojiPanel.init();