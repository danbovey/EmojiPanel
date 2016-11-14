var gulp = require('gulp');
var svgSprite = require('gulp-svg-sprite');
var spinner = require('char-spinner');

module.exports = function() {
    console.log('');
    console.log('Generating sprites with gulp'.inverse);
    console.log('--------------------');
    spinner();

    gulp.src('twemoji/2/svg/*.svg')
        .pipe(svgSprite({
            shape: {
                dimension: {
                    maxWidth: 20,
                    maxHeight: 20
                },
            },
            mode: {
                defs: {
                    dest: '.',
                    prefix: 'emoji-%s',
                    sprite: 'img/emojis.svg',
                    bust: false,
                    example: true
                }
            }
        }))
        .pipe(gulp.dest('chrome'));
};
