var gulp = require('gulp');
var svgSprite = require('gulp-svg-sprite');
var spinner = require('char-spinner');

module.exports = pack => {
    console.log('');
    console.log(`Generating ${pack.name} sprites`.inverse.yellow);
    spinner();

    return new Promise((resolve, reject) => {
        gulp.src(pack.findFile('*'))
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
                        sprite: pack.name + '.svg',
                        bust: false
                    }
                }
            }))
            .pipe(gulp.dest('dist/img'))
            .pipe(gulp.dest('docs/img'))
            .on('end', resolve);
    });
};
