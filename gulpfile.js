var gulp = require('gulp');
var stylus = require('gulp-stylus');
var prefix = require('gulp-autoprefixer');
var preprocess = require('gulp-preprocess');

gulp.task('styles', function () {
    gulp.src('./components/styles/*.styl')
        .pipe(stylus())
        .pipe(prefix())
        .pipe(gulp.dest('./compiled/css/'));
});

gulp.task('html', function() {
  gulp.src('./components/html/*.html')
    .pipe(preprocess())
    .pipe(gulp.dest('./compiled/'))
});

// Watch Files For Changes
gulp.task('watch', function() {
    gulp.watch('./components/styles/*.styl', ['styles']);
     gulp.watch('./components/html/**/*.html', ['html']);
});

gulp.task('default', ['html', 'styles', 'watch']);

