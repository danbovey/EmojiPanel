const Emojis = require('./emojis');
const modifiers = require('./modifiers');

const list = (options, panel, json, emit) => {
    const categories = panel.querySelector('.' + options.classnames.categories);
    const searchInput = panel.querySelector('.' + options.classnames.searchInput);
    const searchTitle = panel.querySelector('.' + options.classnames.searchTitle);
    const frequentTitle = panel.querySelector('.' + options.classnames.frequentTitle);
    const results = panel.querySelector('.' + options.classnames.results);
    const emptyState = panel.querySelector('.' + options.classnames.noResults);
    const footer = panel.querySelector('.' + options.classnames.footer);

    // Update the category links
    while (categories.firstChild) {
        categories.removeChild(categories.firstChild);
    }
    Object.keys(json).forEach(i => {
        const category = json[i];

        // Don't show the link to a hidden category
        if(options.hidden_categories.indexOf(category.name) > -1) {
            return;
        }

        const categoryLink = document.createElement('button');
        categoryLink.classList.add(options.classnames.emoji);
        categoryLink.setAttribute('title', category.name);
        categoryLink.innerHTML = Emojis.createEl(category.icon, options);
        categoryLink.addEventListener('click', e => {
            const title = options.container.querySelector('#' + category.name);
            results.scrollTop = title.offsetTop - results.offsetTop;
        });
        categories.appendChild(categoryLink);        
    });

    // Handle the search input
    if(options.search == true) {
        searchInput.addEventListener('input', e => {
            const emojis = results.querySelectorAll('.' + options.classnames.emoji);
            const titles = results.querySelectorAll('.' + options.classnames.category);

            let frequentList = localStorage.getItem('EmojiPanel-frequent');
            if(frequentList) {
                frequentList = JSON.parse(frequentList);
            } else {
                frequentList = [];
            }

            const value = e.target.value.replace(/-/g, '').toLowerCase();
            if(value.length > 0) {
                const matched = [];
                Object.keys(json).forEach(i => {
                    const category = json[i];
                    category.emojis.forEach(emoji => {
                        const keywordMatch = emoji.keywords.find(keyword => {
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

                emit('search', { value, matched });

                [].forEach.call(emojis, emoji => {
                    if(matched.indexOf(emoji.dataset.unicode) == -1) {
                        emoji.style.display = 'none';
                    } else {
                        emoji.style.display = 'inline-block';
                    }
                });
                [].forEach.call(titles, title => {
                    title.style.display = 'none';
                });
                searchTitle.style.display = 'block';

                if(options.frequent == true) {
                    frequentTitle.style.display = 'none';
                }
            } else {
                [].forEach.call(emojis, emoji => {
                    emoji.style.display = 'inline-block';
                });
                [].forEach.call(titles, title => {
                    title.style.display = 'block';
                });
                searchTitle.style.display = 'none';
                emptyState.style.display = 'none';

                if(options.frequent == true) {
                    if(frequentList.length > 0) {
                        frequentTitle.style.display = 'block';
                    } else {
                        frequentTitle.style.display = 'none';
                    }
                }
            }
        });
    }

    // Fill the results with emojis
    while (results.firstChild) {
        results.removeChild(results.firstChild);
    }
    Object.keys(json).forEach(i => {
        const category = json[i];

        // Don't show any hidden categories
        if(options.hidden_categories.indexOf(category.name) > -1 || category.name == 'modifier') {
            return;
        }

        // Create the category title
        const title = document.createElement('p');
        title.classList.add(options.classnames.category);
        title.id = category.name;
        let categoryName = category.name.replace(/_/g, ' ')
            .replace(/\w\S*/g, (name) => name.charAt(0).toUpperCase() + name.substr(1).toLowerCase())
            .replace('And', '&amp;');
        title.innerHTML = categoryName;
        results.appendChild(title);

        // Create the emoji buttons
        category.emojis.forEach(emoji => results.appendChild(Emojis.createButton(emoji, options, emit)));
    });

    if(options.fitzpatrick) {
        // Create the fitzpatrick modifier button
        const hand = { // ✋
            unicode: '270b' + modifiers[options.fitzpatrick].unicode,
            char: '✋'
        };
        let modifierDropdown;
        const modifierToggle = document.createElement('button');
        modifierToggle.setAttribute('type', 'button');
        modifierToggle.classList.add(options.classnames.btnModifier, options.classnames.btnModifierToggle, options.classnames.emoji);
        modifierToggle.innerHTML = Emojis.createEl(hand, options);
        modifierToggle.addEventListener('click', () => {
            modifierDropdown.classList.toggle('active');
            modifierToggle.classList.toggle('active');
        });
        footer.appendChild(modifierToggle);

        modifierDropdown = document.createElement('div');
        modifierDropdown.classList.add(options.classnames.modifierDropdown);
        Object.keys(modifiers).forEach(m => {
            const modifier = Object.assign({}, modifiers[m]);
            modifier.unicode = '270b' + modifier.unicode;
            modifier.char = '✋' + modifier.char;
            const modifierBtn = document.createElement('button');
            modifierBtn.setAttribute('type', 'button');
            modifierBtn.classList.add(options.classnames.btnModifier, options.classnames.emoji);
            modifierBtn.dataset.modifier = m;
            modifierBtn.innerHTML = Emojis.createEl(modifier, options);

            modifierBtn.addEventListener('click', e => {
                e.stopPropagation();
                e.preventDefault();

                modifierToggle.classList.remove('active');
                modifierToggle.innerHTML = Emojis.createEl(modifier, options);

                options.fitzpatrick = modifierBtn.dataset.modifier;
                modifierDropdown.classList.remove('active');

                // Refresh every emoji in any list with new skin tone
                const emojis = [].forEach.call(options.container.querySelectorAll(`.${options.classnames.results}  .${options.classnames.emoji}`), emoji => {
                    if(emoji.dataset.fitzpatrick) {
                        const emojiObj = {
                            unicode: emoji.dataset.unicode,
                            char: emoji.dataset.char,
                            fitzpatrick: true,
                            category: emoji.dataset.category,
                            name: emoji.dataset.name
                        }
                        emoji.parentNode.replaceChild(Emojis.createButton(emojiObj, options, emit), emoji);
                    }
                });
            });

            modifierDropdown.appendChild(modifierBtn);
        });
        footer.appendChild(modifierDropdown);
    }
};

module.exports = list;
