var ghdownload = require('github-download');
var spinner = require('char-spinner');

var repo = {
    user: 'twitter',
    repo: 'twemoji',
    ref: 'gh-pages'
};

module.exports = function(callback) {
    console.log(('Downloading ' + repo.user + '/' + repo.repo + ' repo').inverse);
    console.log('--------------------');
    spinner();

    ghdownload(repo, repo.repo)
        .on('zip', function(zipUrl) {
            // GitHub API limit was reached
            console.log(zipUrl);
        })
        .on('error', function(err) {
            console.error(err);
        })
        .on('end', function() {
            callback();
        });
};
