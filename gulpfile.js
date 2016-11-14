var gulp = require('gulp');
var watch = require('gulp-watch');
var notify = require('gulp-notify');
var sass = require('gulp-sass');
var sourcemaps = require('gulp-sourcemaps');

var browserify = require('browserify');
var babelify = require('babelify');
var uglify = require('gulp-uglify');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var es = require('event-stream');
var runSequence = require('run-sequence');

gulp.task('scss', function() {
    return gulp.src('scss/style.scss')
        .pipe(sass({outputStyle: 'compressed'}))
        .pipe(gulp.dest('chrome/css'))
        .pipe(notify("Compiled SCSS"));
});

gulp.task('js', function() {
    var files = [
        'js/content.js',
        'js/options.js'
    ];

    var tasks = files.map(function(entry) {
        return browserify({
                entries: [entry]
            })
            .transform(babelify.configure({
                presets: ["es2015"]
            }))
            .bundle()
            .on('error', function (e) {
                console.log(e);
            })
            .pipe(source(entry))
            .pipe(buffer())
            .pipe(sourcemaps.init({loadMaps: true}))
            .pipe(uglify().on('error', function(e) {
                console.log(e);
            }))
            .pipe(sourcemaps.write())
            .pipe(gulp.dest('chrome'))
            .pipe(notify("Compiled JS"));
    });

    return es.merge.apply(null, tasks);
});

gulp.task('default', function() {
    runSequence('scss', 'js');

    gulp.watch('scss/**/*.scss', ['scss']);
    gulp.watch('js/**/*.js', ['js']);
});
