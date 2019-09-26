const fs = require('fs');
const del = require('del');
require('colors');

const buildJson = require('./json');
const generateSprite = require('./sprite');
const ghdownload = require('github-download');

const packs = [
    {
        name: 'twemoji',
        location: 'build/twemoji',
        findFile: unicode => `build/twemoji/2/svg/${unicode}.svg`
    },
    {
        name: 'emojione',
        location: 'node_modules/emojione',
        findFile: unicode => `node_modules/emojione/assets/svg/${unicode}.svg`
    }
];

const build = pack => {
    try {
        fs.statSync(pack.location);

        return generateSprite(pack);
    } catch(err) {
        return Promise.reject(err);
    }
};

const buildNext = () => {
    const pack = packs.shift();

    if(pack) {
        return build(pack)
            .then(() => buildNext())
            .catch(err => console.log(err));
    } else {
        del.sync(['build/twemoji'], { force:true });
        console.log('Complete!'.inverse.green)
    }
};

const downloadTwemoji = () => {
    ghdownload({user: 'twitter', repo: 'twemoji', ref: 'gh-pages'}, process.cwd() + '/build/twemoji')
        .on('end', function() {
            buildNext();
        });
}

buildJson();
module.exports = downloadTwemoji();
