const Tether = require('tether');

const Emojis = require('./emojis');

const Create = (options, emit, toggle) => {
    if(options.editable) {
        // Set the caret offset on the input
        const handleChange = e => {
            options.editable.dataset.offset = getCaretPosition(options.editable);
        };
        options.editable.addEventListener('keyup', handleChange);
        options.editable.addEventListener('change', handleChange);
        options.editable.addEventListener('click', handleChange);
    }

    // Create the dropdown panel
    const panel = document.createElement('div');
    panel.classList.add(options.classnames.panel);
    const content = document.createElement('div');
    content.classList.add(options.classnames.content);
    panel.appendChild(content);

    let searchInput;
    let results;
    let emptyState;
    let frequentTitle;

    if(options.trigger) {
        panel.classList.add(options.classnames.trigger);
        // Listen for the trigger
        options.trigger.addEventListener('click', () => toggle());

        // Create the tooltip
        options.trigger.setAttribute('title', options.locale.add);
        const tooltip = document.createElement('span');
        tooltip.classList.add(options.classnames.tooltip);
        tooltip.innerHTML = options.locale.add;
        options.trigger.appendChild(tooltip);
    }

    // Create the category links
    const header = document.createElement('header');
    header.classList.add(options.classnames.header);
    content.appendChild(header);

    const categories = document.createElement('div');
    categories.classList.add(options.classnames.categories);
    header.appendChild(categories);

    for(let i = 0; i < 9; i++) {
        const categoryLink = document.createElement('button');
        categoryLink.classList.add('temp');
        categories.appendChild(categoryLink);
    }
    
    // Create the list
    results = document.createElement('div');
    results.classList.add(options.classnames.results);
    content.appendChild(results);

    // Create the search input
    if(options.search == true) {
        const query = document.createElement('div');
        query.classList.add(options.classnames.query);
        header.appendChild(query);

        searchInput = document.createElement('input');
        searchInput.classList.add(options.classnames.searchInput);
        searchInput.setAttribute('type', 'text');
        searchInput.setAttribute('autoComplete', 'off');
        searchInput.setAttribute('placeholder', options.locale.search);
        query.appendChild(searchInput);

        const icon = document.createElement('div');
        icon.innerHTML = options.icons.search;
        query.appendChild(icon);

        const searchTitle = document.createElement('p');
        searchTitle.classList.add(options.classnames.category, options.classnames.searchTitle);
        searchTitle.style.display = 'none';
        searchTitle.innerHTML = options.locale.search_results;
        results.appendChild(searchTitle);

        emptyState = document.createElement('span');
        emptyState.classList.add(options.classnames.noResults);
        emptyState.innerHTML = options.locale.no_results;
        results.appendChild(emptyState);
    }

    if(options.frequent == true) {
        let frequentList = localStorage.getItem('EmojiPanel-frequent');
        if(frequentList) {
            frequentList = JSON.parse(frequentList);
        } else {
            frequentList = [];
        }
        frequentTitle = document.createElement('p');
        frequentTitle.classList.add(options.classnames.category, options.classnames.frequentTitle);
        frequentTitle.innerHTML = options.locale.frequent;
        if(frequentList.length == 0) {
            frequentTitle.style.display = 'none';
        }
        results.appendChild(frequentTitle);

        const frequentResults = document.createElement('div');
        frequentResults.classList.add('EmojiPanel-frequent');

        frequentList.forEach(emoji => {
            frequentResults.appendChild(Emojis.createButton(emoji, options, emit));
        });
        results.appendChild(frequentResults);
    }

    const loadingTitle = document.createElement('p');
    loadingTitle.classList.add(options.classnames.category);
    loadingTitle.textContent = options.locale.loading;
    results.appendChild(loadingTitle);
    for(let i = 0; i < 9 * 8; i++) {
        const tempEmoji = document.createElement('button');
        tempEmoji.classList.add('temp');
        results.appendChild(tempEmoji);
    }

    const footer = document.createElement('footer');
    footer.classList.add(options.classnames.footer);
    panel.appendChild(footer);

    if(options.locale.brand) {
        const brand = document.createElement('a');
        brand.classList.add(options.classnames.brand);
        brand.setAttribute('href', 'https://emojipanel.js.org');
        brand.textContent = options.locale.brand;
        footer.appendChild(brand);
    }

    // Append the dropdown menu to the container
    options.container.appendChild(panel);

    // Tether the dropdown to the trigger
    let tether;
    if(options.trigger && options.tether) {
        const placements = ['top', 'right', 'bottom', 'left'];
        if(placements.indexOf(options.placement) == -1) {
            throw new Error(`Invalid attachment '${options.placement}'. Valid placements are '${placements.join(`', '`)}'.`);
        }

        let attachment;
        let targetAttachment;
        switch(options.placement) {
            case placements[0]: case placements[2]:
                attachment = (options.placement == placements[0] ? placements[2] : placements[0]) + ' center';
                targetAttachment = (options.placement == placements[0] ? placements[0] : placements[2]) + ' center';
                break;
            case placements[1]: case placements[3]:
                attachment = 'top ' + (options.placement == placements[1] ? placements[3] : placements[1]);
                targetAttachment = 'top ' + (options.placement == placements[1] ? placements[1] : placements[3]);
                break;
        }

        tether = new Tether({
            element: panel,
            target: options.trigger,
            attachment,
            targetAttachment
        });
    }

    // Return the panel element so we can update it later
    return {
        panel,
        tether
    };
};

const getCaretPosition = el => {
    let caretOffset = 0;
    const doc = el.ownerDocument || el.document;
    const win = doc.defaultView || doc.parentWindow;
    let sel;
    if(typeof win.getSelection != 'undefined') {
        sel = win.getSelection();
        if(sel.rangeCount > 0) {
            const range = win.getSelection().getRangeAt(0);
            const preCaretRange = range.cloneRange();
            preCaretRange.selectNodeContents(el);
            preCaretRange.setEnd(range.endContainer, range.endOffset);
            caretOffset = preCaretRange.toString().length;
        }
    } else if((sel = doc.selection) && sel.type != 'Control') {
        const textRange = sel.createRange();
        const preCaretTextRange = doc.body.createTextRange();
        preCaretTextRange.moveToElementText(el);
        preCaretTextRange.setEndPoint('EndToEnd', textRange);
        caretOffset = preCaretTextRange.text.length;
    }
    
    return caretOffset;
};

module.exports = Create;
