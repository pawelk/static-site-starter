var gulp = require('gulp');
var gutil = require('gulp-util');
var less = require('gulp-less');
var prefix = require('gulp-autoprefixer');
var connect = require('gulp-connect');
var uglify = require('gulp-uglify');
var sourcemaps = require('gulp-sourcemaps');
var newer = require('gulp-newer');
var plumber = require('gulp-plumber');
var rename = require('gulp-rename');
var master = require('gulp-handlebars-master');
var fs = require('fs');

    
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

gulp.task('handlebars', function() {

    var options = {
	batch : [ './components/html/parts/' ]
    };

    var templatedata = JSON.parse(fs.readFileSync('./components/data.json'));
	templatedata._package = require('./package.json');
	templatedata.build = Date.now();

    gulp.src('./components/html/pages/*.hbs')
	.pipe(master('./components/html/master.hbs', templatedata, options))
	.pipe( rename( function(path){
	    path.extname = '.html';
	}))
	.pipe(gulp.dest('./compiled/'))
	.pipe(connect.reload());
});


gulp.task('scripts', function() {
	gulp.src('./components/scripts/**/*.js')
		.pipe(plumber())
		.pipe(sourcemaps.init())
		.pipe(uglify())		
		.pipe(sourcemaps.write('./maps'))
		.pipe(plumber.stop())
		.pipe(gulp.dest('./compiled/js/'))
		.pipe(connect.reload());
});

// for fonts
gulp.task('copy', function() {
	gulp.src('./components/fonts/**')
	    .pipe(newer('./compiled/fonts'))
	    .pipe(gulp.dest('./compiled/fonts'))
	    .pipe(connect.reload());
	gulp.src('./components/libs/**')
	    .pipe(newer('./compiled/js/libs'))
	    .pipe(gulp.dest('./compiled/js/libs'))
	    .pipe(connect.reload());
	gulp.src('./components/images/**')
	    .pipe(newer('./compiled/img'))
	    .pipe(gulp.dest('./compiled/img'))
	    .pipe(connect.reload());
    
});

// Watch Files For Changes
gulp.task('watch', ['server'], function() {
	gulp.watch('./components/styles/**/*.less', ['styles']);
	gulp.watch('./components/html/**/*', ['handlebars']);
	gulp.watch('./components/*.json', ['handlebars']);
	gulp.watch('./components/scripts/**', ['scripts']);
	gulp.watch('./components/images/**', ['copy']);
});

gulp.task('default', ['styles', 'scripts', 'handlebars', 'copy', 'watch']);
