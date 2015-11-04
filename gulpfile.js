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
var browserSync;
var del;


var plumberErrorHandler = function( e ){
    gutil.log( e );
    gutil.beep();
};

var options = {
    src : './components/',
    dest : './compiled/',
    assets : ['libs', 'fonts', 'images'],
    dev : gutil.env.dev
};


gulp.task('server', ['styles', 'scripts', 'handlebars', 'copy'], () => {
    var assets = options.assets.map((dir)=>(options.src+dir+'/**/*'));
    browserSync = require("browser-sync").create();
    browserSync.init({
        server: {
            baseDir: options.dest
        }
    });

    gulp.watch( options.src + 'styles/*.less', ['styles'] );
    gulp.watch( options.src + 'scripts/**/*.js', ['watch-js']);
    gulp.watch( options.src + 'html/**/*.hbs', ['handlebars']);
    gulp.watch( options.src + '*.json', ['watch-hbs']);
    gulp.watch( assets, ['watch-assets']);
    gulp.watch( options.dest + '**/*.html', ['watch-html']);
});

gulp.task('watch-js', ['scripts'], ()=>browserSync.reload());
gulp.task('watch-html', ()=>browserSync.reload());
gulp.task('watch-assets', ['copy'], ()=>browserSync.reload());

gulp.task('styles', ['clean'], () => {
    var stream = gulp.src('./components/styles/*.less')
		.pipe(plumber(plumberErrorHandler))
		.pipe(gulpif( options.dev, sourcemaps.init()) )
		.pipe(less({
			compress : !options.dev
		 }))
		.pipe(prefix())
		.pipe(gulpif( options.dev, sourcemaps.write('./maps')) )
		.pipe(plumber.stop())
		.pipe(gulp.dest('./compiled/css/'));
    if( browserSync ){
	stream = stream.pipe( browserSync.stream({match: '**/*.css'}));
    }
    return stream;
});

gulp.task('handlebars', ['clean'], () => {

    var options = {
	batch : [ './components/html/parts/' ]
    };

    var templatedata = JSON.parse(fs.readFileSync('./components/data.json'));
	templatedata._package = require('./package.json');
	templatedata.build = Date.now();

    return gulp.src('./components/html/pages/*.hbs')
	.pipe(plumber(plumberErrorHandler))
	.pipe(master('./components/html/master.hbs', templatedata, options))
	.pipe(plumber.stop())
	.pipe( rename( function(path){
	    path.extname = '.html';
	}))
	.pipe(gulp.dest('./compiled/'));

});

gulp.task('scripts', ['clean'], () => {
    var b = browserify({ 
	    entries : './components/scripts/main.js',
	    debug: true,
	    transform : [ babelify ]
    });
    return b.bundle()
	.pipe(source('main.js'))
	.pipe(plumber(plumberErrorHandler))
	.pipe(buffer())
	.pipe(gulpif( options.dev, sourcemaps.init({loadMaps: true})) )
        .pipe(uglify())
	.pipe(sourcemaps.write('./compiled/js/'))
	.pipe(plumber.stop())
	.pipe(gulp.dest('./compiled/js/'));
});

// static assets
gulp.task('copy', ['clean'], () => {
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

gulp.task('clean', function(){
    if( !options.dev ){
	del = require('del');
	gutil.log('no --dev option. cleaning up the ' + options.dest +' dir');
	return del( options.dest );
    }
    else {
	gutil.log('--dev: no clean-up in the destination dir');
	return true;
    }
});

gulp.task('default', ['server']);
gulp.task('build', ['styles', 'scripts', 'handlebars', 'copy']);
