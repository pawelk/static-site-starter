var gulp = require('gulp');
var gutil = require('gulp-util');
var less = require('gulp-less');
var prefix = require('gulp-autoprefixer');
var fileinclude = require('gulp-file-include');
var connect = require('gulp-connect');
var uglify = require('gulp-uglify');
var sourcemaps = require('gulp-sourcemaps');
var imagemin = require('gulp-imagemin');
var newer = require('gulp-newer');

gulp.task('server', function() {
	connect.server({
		root: './compiled/',
		port: 8080,
		livereload: true
	});
});

gulp.task('styles', function() {
	gulp.src('./components/styles/*.less')
		.pipe(sourcemaps.init())
		.pipe(less())
		.on('error', gutil.log)
		.on('error', gutil.beep)
		.pipe(prefix())
		.pipe(sourcemaps.write('./maps'))
		.pipe(gulp.dest('./compiled/css/'))
		.pipe(connect.reload());
});

gulp.task('html', function() {
	gulp.src('./components/html/*.html')
		.pipe(fileinclude())
		.pipe(gulp.dest('./compiled/'))
		.pipe(connect.reload());
});

gulp.task('images', function() {
	gulp.src('./components/images/**')
		.pipe(newer('./compiled/img/'))
		.pipe(imagemin())
		.pipe(gulp.dest('./compiled/img/'))
		.pipe(connect.reload());
});

gulp.task('scripts', function() {
	gulp.src('./components/scripts/**/*.js')
		.pipe(sourcemaps.init())
		.pipe(uglify())		
		.pipe(sourcemaps.write('./maps'))
		.pipe(gulp.dest('./compiled/js/'))
		.pipe(connect.reload());
});

// Watch Files For Changes
gulp.task('watch', ['server'], function() {
	gulp.watch('./components/styles/**/*.less', ['styles']);
	gulp.watch('./components/html/**/*.html', ['html']);
	gulp.watch('./components/images/**', ['images']);
	gulp.watch('./components/scripts/**', ['scripts']);
});

gulp.task('default', ['styles', 'scripts', 'images', 'html', 'watch']);