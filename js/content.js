var EmojiPanel = {
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
    writeEmoji: function(char, el) {
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

            input.textContent = input.textContent.substring(0, offset) + char + input.textContent.substring(offset, input.textContent.length)
        }
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
            var el = null;
            // The target could be svg or use element, or the button itself
            if(e.target.classList.contains('emoji')) {
                el = e.target;
            } else if(e.target.parentNode) {
                var parent = e.target.parentNode;
                if(parent.classList.contains('emoji')) {
                    el = parent;
                } else if(parent.parentNode && parent.parentNode.classList.contains('emoji')) {
                    el = parent.parentNode;
                }
            }

            if(el) {
                self.writeEmoji(el.dataset.char, el.parentNode);
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
                                input.focus();
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

                        var results = document.createElement('div');
                        results.classList.add('EmojiPanel-results');
                        results.style.height = '160px';

                        var emptyState = document.createElement('span');
                        emptyState.classList.add('EmojiPanel-noResults');
                        emptyState.innerHTML = 'No results.';
                        results.appendChild(emptyState);

                        var order = ['people', 'animals_and_nature', 'food_and_drink', 'objects', 'activity', 'travel_and_places', 'symbols', 'flags'];
                        for(var i in order) {
                            for(var j in self.json) {
                                if(self.json[j].name == order[i]) {
                                    var emojis = self.json[j].emojis;

                                    for(var e in emojis) {
                                        var emoji = emojis[e];

                                        var button = document.createElement('button');
                                        button.setAttribute('type', 'button');
                                        button.innerHTML = '<svg viewBox="0 0 20 20"><use xlink:href="#' + emoji.hex + '"></use></svg>';
                                        button.classList.add('emoji');
                                        button.dataset.char = emoji.char;
                                        button.dataset.hex = emoji.hex;

                                        results.appendChild(button);
                                    }

                                    break;
                                }
                            }
                        }

                        content.appendChild(results);
                        dropdownMenu.appendChild(content);
                        dropdown.appendChild(btn);
                        dropdown.appendChild(dropdownMenu);
                        extraItem.appendChild(dropdown);
                        extras.appendChild(extraItem);

                        input.addEventListener('input', function(e) {
                            var matched = [];
                            var emojis = results.querySelectorAll('.emoji');

                            var value = e.target.value;
                            value = value.replace(/-/g, '').toLowerCase();
                            if(value.length > 0) {
                                for(var c in self.json) {
                                    var category = self.json[c];

                                    for(var e in category.emojis) {
                                        var emoji = category.emojis[e];

                                        for(var k in emoji.keywords) {
                                            var keyword = emoji.keywords[k];
                                            keyword = keyword.replace(/-/g, '').toLowerCase();

                                            if(keyword.indexOf(value) > -1) {
                                                matched.push(emoji.hex);
                                                break;
                                            }
                                        }
                                    }
                                }

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
                            } else {
                                [].forEach.call(emojis, function(emoji) {
                                    emoji.style.display = 'inline-block';
                                });
                            }
                        });
                    }
                });
            }
        });

        // Hide the DM emojibars
        var emojiBars = document.querySelectorAll('.DMComposer-emojiBar');
        [].forEach.call(emojiBars, function(bar) {
            bar.parentNode.removeChild(bar);
        });
    }
};

EmojiPanel.init();