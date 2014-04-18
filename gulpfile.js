var gulp = require('gulp');
var stylus = require('gulp-stylus');
var prefix = require('gulp-autoprefixer');
var preprocess = require('gulp-preprocess');
var connect = require('gulp-connect');

gulp.task('server', function() {
	connect.server({
		root: './compiled/',
		port: 8080,
		livereload: true
	});
});

gulp.task('styles', function () {
	gulp.src('./components/styles/*.styl')
	.pipe(stylus())
	.pipe(prefix())
	.pipe(gulp.dest('./compiled/css/'))
	.pipe(connect.reload());
});

gulp.task('html', function() {
	gulp.src('./components/html/*.html')
	.pipe(preprocess())
	.pipe(gulp.dest('./compiled/'))
	.pipe(connect.reload());
});

gulp.task('images', function() {
	gulp.src('./components/images/**')	
	.pipe(gulp.dest('./compiled/img/'))
});

// Watch Files For Changes
gulp.task('watch', ['server'], function() {
	gulp.watch('./components/styles/*.styl', ['styles']);
	gulp.watch('./components/html/**/*.html', ['html']);
});

gulp.task('default', ['styles', 'html', 'images', 'watch']);

