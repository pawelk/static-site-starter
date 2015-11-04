var gulp = require('gulp');
var gutil = require('gulp-util');
var less = require('gulp-less');
var prefix = require('gulp-autoprefixer');
var uglify = require('gulp-uglify');
var sourcemaps = require('gulp-sourcemaps');
var newer = require('gulp-newer');
var plumber = require('gulp-plumber');
var rename = require('gulp-rename');
var master = require('gulp-handlebars-master');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var browserify = require('browserify');
var babelify = require('babelify');
var gulpif = require('gulp-if');
var fs = require('fs');
var browserSync = require("browser-sync").create();

var plumberErrorHandler = function( e ){
    gutil.log( e );
    gutil.beep();
};

var prod = false;

gulp.task('set-prod', function(){
    prod = true;
});

gulp.task('server', ['styles', 'scripts', 'handlebars', 'copy'], function() {
    var src = './components/';
    var dest = './compiled/';
    var assets = ['libs', 'fonts', 'images'].map((dir)=>(src+dir+'/**/*'));
    browserSync.init({
        server: {
            baseDir: dest
        }
    });

    gulp.watch( src + 'styles/*.less', ['styles'] );
    gulp.watch( src + 'scripts/**/*.js', ['watch-js']);
    gulp.watch( src + 'html/**/*.hbs', ['handlebars']);
    gulp.watch( src + '*.json', ['watch-hbs']);
    gulp.watch( assets, ['watch-assets']);
    gulp.watch( dest + '**/*.html', ['watch-html']);
});

gulp.task('watch-js', ['scripts'], ()=>browserSync.reload());
gulp.task('watch-html', ()=>browserSync.reload());
gulp.task('watch-assets', ['copy'], ()=>browserSync.reload());

gulp.task('styles', function() {
	gulp.src('./components/styles/*.less')
		.pipe(plumber(plumberErrorHandler))
		.pipe(gulpif( !prod, sourcemaps.init()) )
		.pipe(less({
			compress : prod
		 }))
		.pipe(prefix())
		.pipe(gulpif(!prod, sourcemaps.write('./maps')) )
		.pipe(plumber.stop())
		.pipe(gulp.dest('./compiled/css/'))
		.pipe(browserSync.stream({match: '**/*.css'}));
});

gulp.task('handlebars', function() {

    var options = {
	batch : [ './components/html/parts/' ]
    };

    var templatedata = JSON.parse(fs.readFileSync('./components/data.json'));
	templatedata._package = require('./package.json');
	templatedata.build = Date.now();

    gulp.src('./components/html/pages/*.hbs')
	.pipe(plumber(plumberErrorHandler))
	.pipe(master('./components/html/master.hbs', templatedata, options))
	.on('error', gutil.log)
	.on('error', gutil.beep)
	.pipe(plumber.stop())
	.pipe( rename( function(path){
	    path.extname = '.html';
	}))
	.pipe(gulp.dest('./compiled/'));


});

gulp.task('scripts', function() {
    var b = browserify({ 
	    entries : './components/scripts/main.js',
	    debug: true,
	    transform : [ babelify ]
    });
    return b.bundle()
	.pipe(source('main.js'))
	.pipe(plumber(plumberErrorHandler))
	.pipe(buffer())
	.pipe(gulpif( !prod, sourcemaps.init({loadMaps: true})) )
        .pipe(uglify())
	.pipe(sourcemaps.write('./compiled/js/'))
	.pipe(plumber.stop())
	.pipe(gulp.dest('./compiled/js/'));
});

// static assets
gulp.task('copy', function() {
	gulp.src('./components/fonts/**')
	    .pipe(newer('./compiled/fonts'))
	    .pipe(gulp.dest('./compiled/fonts'));
	gulp.src('./components/libs/**')
	    .pipe(newer('./compiled/js/libs'))
	    .pipe(gulp.dest('./compiled/js/libs'));
	gulp.src('./components/images/**')
	    .pipe(newer('./compiled/img'))
	    .pipe(gulp.dest('./compiled/img'));
    
});

gulp.task('default', ['server']);
