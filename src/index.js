const { EventEmitter } = require('fbemitter');

const Create = require('./create');
const Emojis = require('./emojis');

const defaults = {
    search: true,
    frequent: true,
    fitzpatrick: 'a',
    hidden_categories: [],

    pack_url: null,
    json_url: '/emojis.json',

    tether: true,
    placement: 'bottom',

    locale: {
        add: 'Add emoji',
        search: 'Search',
        search_results: 'Search results',
        no_results: 'No results',
        frequent: 'Frequently used',
        brand: 'EmojiPanel'
    },
    icons: {
        search: '<span class="fa fa-search"></span>'
    }
};

export default class EmojiPanel extends EventEmitter {
    constructor(options) {
        super();

        this.options = Object.assign({}, defaults, options);

        const els = ['container', 'trigger', 'editable'];
        els.forEach(el => {
            if(typeof this.options[el] == 'string') {
                this.options[el] = document.querySelector(this.options[el]);
            }
        });

        Emojis.load(this.options)
            .then(res => {
                Create(this.options, res[1], this.emit.bind(this))
            });
    }
}

if(typeof window != 'undefined') {
    window.EmojiPanel = EmojiPanel;
}
