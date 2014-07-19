'use strict';
// generated on 2014-07-18 using generator-gulp-webapp 0.1.0

var gulp = require('gulp');

// load plugins
var $ = require('gulp-load-plugins')();
var path = require('path')
var mainBowerFiles = require('main-bower-files');
var _ = require('underscore')
var sourcemaps = require('gulp-sourcemaps');
//var coffee = require('gulp-coffee');
//var compass = require('gulp-compass');
//var jade = require('gulp-jade')
var gutil = require('gulp-util');
var Q = require("q");

gulp.task('styles', function () {
    return gulp.src('app/styles/main.css')
        .pipe($.autoprefixer('last 1 version'))
        .pipe(gulp.dest('.tmp/styles'))
        .pipe($.size());
});


gulp.task('scripts', function () {
    return gulp.src('app/scripts/**/*.js')
        .pipe($.jshint())
        .pipe($.jshint.reporter(require('jshint-stylish')))
        .pipe($.size());
});


gulp.task('html', ['styles', 'scripts'], function () {
    var jsFilter = $.filter('**/*.js');
    var cssFilter = $.filter('**/*.css');

    return gulp.src('app/*.html')
        .pipe($.useref.assets({searchPath: '{.tmp,app}'}))
        .pipe(jsFilter)
        .pipe($.uglify())
        .pipe(jsFilter.restore())
        .pipe(cssFilter)
        .pipe($.csso())
        .pipe(cssFilter.restore())
        .pipe($.useref.restore())
        .pipe($.useref())
        .pipe(gulp.dest('dist'))
        .pipe($.size());
});

gulp.task('images', function () {
    return gulp.src('app/images/**/*')
        .pipe($.cache($.imagemin({
            optimizationLevel: 3,
            progressive: true,
            interlaced: true
        })))
        .pipe(gulp.dest('dist/images'))
        .pipe($.size());
});

gulp.task('fonts', function () {
    //console.log("==fonts==")
    //console.log(mainBowerFiles())
    return  gulp.src(mainBowerFiles(/* options */))  //$.bowerFiles()
        .pipe($.filter('**/*.{eot,svg,ttf,woff}'))
        .pipe($.flatten())
        .pipe(gulp.dest('dist/fonts'))
        .pipe($.size());
});

gulp.task('extras', function () {
    return gulp.src(['app/*.*', '!app/*.html'], { dot: true })
        .pipe(gulp.dest('dist'));
});
//usage task ========================================================


gulp.task('clean', function (cb) {
    return gulp.src(['.tmp', 'dist'], { read: false }).pipe($.clean());
});


//coffee
gulp.task('coffee',function(){
    gulp.src(['app/scripts/{,*/}*.coffee'])
    .pipe($.coffee())
    .on('error',gutil.log)
    .pipe(gulp.dest('.tmp/scripts'))
});
gulp.task('compass',function(){
    var compassConfig = {
        debug: true,
        css:'.tmp/styles',
        sass: 'app/styles',
        //image: 'app/image',
        //images_dir: 'app/images',
        //generated_images_dir: '.tmp/images/generated',
        //http_images_path: 'images',
        //http_generated_images_path: '.tmp/images/generated',
        //asset_cache_buster: false, 
        //relative_assets: false,
        //require:['rgbapng'],
        //project: path.join(__dirname, ''),
        //project: __dirname,
        //sass: 'sass',
        //css: 'css',
        //sassDir: 'styles',
        //cssDir: '.tmp/styles',
        //javascriptsDir: '<%= config.app %>/scripts',
        //fontsDir: '<%= config.app %>/styles/fonts',
        //importPath: '<%= config.app %>/bower_components',
        //httpFontsPath: '/styles/fonts',
    }
    gulp.src(['./app/styles/*.{sass,scss}'])
    .pipe($.compass(compassConfig))
    .pipe(gulp.dest('.tmp/styles'));
});
gulp.task('jade',function(){
    var jadeConfig = {
        pretty:true
    }
    gulp.src(['app/jade/{,*/}*.jade'])
    .pipe($.jade(jadeConfig))
    .on('error',gutil.log)
    .pipe(gulp.dest('.tmp'))
});


//main task ===========================================================
gulp.task('build', ['html', 'images', 'fonts', 'extras']);

gulp.task('default', ['clean'], function () {
    gulp.start('build');
});


//connect server and livereload
gulp.task('connect', function () {
    var connect = require('connect');
    var app = connect()
        .use(require('connect-livereload')({ port: 35729 }))
        .use(connect.static('app'))
        .use(connect.static('.tmp'))
        .use(connect.directory('app'));

    require('http').createServer(app)
        .listen(9000)
        .on('listening', function () {
            gutil.log('Started connect web server on http://localhost:9000');
        });
});

gulp.task('serve', ['connect'], function () {
    //require('opn')('http://localhost:9000');
    gutil.log("dev serve is on http://localhost:9000");
});

// inject bower components
gulp.task('wiredep', function () {
    var wiredep = require('wiredep').stream;

    gulp.src('app/*.html')
        .pipe(wiredep({
            directory: 'app/bower_components'
        }))
        .pipe(gulp.dest('app'));
});


gulp.task('watch', [
    'clean'
    ],function(){
        gulp.start([
            'coffee',
            'jade',
            'compass',
            'connect', 
            'serve'], function () {
            var server = $.livereload();

            // watch for changes
            gulp.watch([
                //'app/*.html',
                //'.tmp/styles/**/*.css',
                //'app/scripts/**/*.js',
                //'app/images/**/*'
                
                '.tmp/scripts/{,*/}*.js',
                '.tmp/styles/{,*/}*.css',
                '.tmp/{,*/}*.html',
            ]).on('change', function (file) {
                server.changed(file.path);
            });

            gulp.watch('app/scripts/{,*/}*.coffee', ['coffee'])
            gulp.watch('app/styles/{,*/}*.{sass,scss}', ['compass'])
            gulp.watch('app/jade/{,*/}*.jade', ['jade'])

            //gulp.watch('app/styles/**/*.css', ['styles']);
            //gulp.watch('app/scripts/**/*.js', ['scripts']);
            //gulp.watch('app/images/**/*', ['images']);
            //gulp.watch('bower.json', ['wiredep']);
            gutil.log("===RUN===");
        });
    }
);
