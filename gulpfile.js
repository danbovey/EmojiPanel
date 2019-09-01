const gulp = require('gulp');
const util = require('gulp-util');
const sass = require('gulp-sass');
const source = require('vinyl-source-stream');
const buffer = require('vinyl-buffer');
const browserify = require('browserify');
const watchify = require('watchify');
const babel = require('babelify');
const uglify = require('gulp-uglify');
const rename = require('gulp-rename');

let dev = false;

gulp.task('js', (done) => {
    const bundler = watchify(browserify('./src/index.js', { debug: dev })
        .transform(babel, {
            presets: ['es2015']
        }));

    const rebundle = () => {
        console.log('-> bundling...');

        return bundler.bundle()
            .once('error', function(err) { console.error(err); this.emit('end'); })
            .pipe(source('emojipanel.js'))
            .pipe(buffer())
            .pipe(!dev ? uglify() : util.noop())
            .pipe(gulp.dest('./dist'))
            .pipe(gulp.dest('./docs/js'))
            .once('end', () => {
                console.log('-> bundled!')

                if(!dev) {
                    process.exit();
                }
            });
    };

    if(dev) {
        bundler.on('update', () => rebundle());
    }

    rebundle();
    done();
});

gulp.task('scss', (done) => {
    gulp.src('./scss/panel.scss')
        .pipe(sass({ outputStyle: 'compressed' }).on('error', sass.logError))
        .pipe(rename('emojipanel.css'))
        .pipe(gulp.dest('./dist'))
        .pipe(gulp.dest('./docs/css'));

    done();
});

gulp.task('build', gulp.series('scss', 'js'));

gulp.task('dev', (done) => {
    dev = true;
    done();
})

gulp.task('watch', gulp.series('dev', 'scss', 'js', (done) => {
    gulp.watch('scss/**/*.scss', gulp.series('scss'));
    done();
}));

gulp.task('default', gulp.series('watch', (done) => {
    done();
}));
