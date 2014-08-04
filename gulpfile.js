var gulp = require('gulp');
var gutil = require('gulp-util');
var less = require('gulp-less');
var prefix = require('gulp-autoprefixer');
var preprocess = require('gulp-preprocess');
var connect = require('gulp-connect');
var uglify = require('gulp-uglify');
var concat = require('gulp-concat');
var sourcemaps = require('gulp-sourcemaps');
var imagemin = require('gulp-imagemin');
var pngcrush = require('imagemin-pngcrush');
var newer = require('gulp-newer');
var gulpif = require('gulp-if');
var del = require('del');

var prod = false;

gulp.task('set-prod', function() {
    prod = true;
});

gulp.task( 'clean', function(cb){
	del(['compiled/**/*'], cb);
});

gulp.task('server', function() {
	connect.server({
		root: './compiled/',
		port: 8080,
		livereload: true
	});
});

gulp.task('styles', function() {
	gulp.src('./components/styles/*.less')
		.pipe(gulpif( !prod, sourcemaps.init()) )
		.pipe(less({
			compress : prod
		 }))
		.on('error', gutil.log)
		.on('error', gutil.beep)
		.pipe(prefix())
		.pipe(gulpif(!prod, sourcemaps.write('./maps')) )
		.pipe(gulp.dest('./compiled/css/'))
		.pipe(connect.reload());
});

gulp.task('html', function() {
	gulp.src('./components/html/*.html')
		.pipe(preprocess({ context : { ENV : prod ? 'prod' : 'dev', BUILD : (new Date()).getTime() }  }))
		.pipe(gulp.dest('./compiled/'))
		.pipe(connect.reload());
});

gulp.task('images', function() {
	gulp.src('./components/images/**')
		.pipe(newer('./compiled/img/'))
		.pipe(imagemin({
			 use: [pngcrush()]
		}))
		.pipe(gulp.dest('./compiled/img/'))
		.pipe(connect.reload());
});

gulp.task('scripts', function() {
	gulp.src('./components/scripts/**/*.js')
		.pipe(gulpif(!prod, sourcemaps.init()) )
		.pipe(gulpif( prod, uglify()))
		.pipe(gulpif( prod,concat('all.min.js')))
		.pipe(gulpif(!prod, sourcemaps.write('./maps')))
		.pipe(gulp.dest('./compiled/js/'))
		.pipe(connect.reload());
});

// Watch Files For Changes
gulp.task('watch', ['server'], function() {
	gulp.watch('./components/styles/*.less', ['styles']);
	gulp.watch('./components/html/**/*.html', ['html']);
	gulp.watch('./components/images/**', ['images']);
	gulp.watch('./components/scripts/**', ['scripts']);
});

gulp.task('default', ['styles', 'scripts', 'images', 'html', 'watch']);
gulp.task('deploy', ['set-prod', 'clean'], function(){ return gulp.start( 'styles', 'scripts', 'images', 'html', 'watch' ); });
