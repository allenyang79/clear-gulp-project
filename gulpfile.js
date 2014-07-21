'use strict';
// generated on 2014-07-18 using generator-gulp-webapp 0.1.0

var gulp = require('gulp');
var gaze = require('gaze');

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
    //var cwd = 'app/scripts/'
    //var src = path.join(cwd,'{,*/}*.coffee')
    //var dest = '.tmp/scripts/'
    //gulp.watch(src)
    //.on('change',function(event){
    //    var to = path.dirname(event.path).replace(path.join(__dirname,cwd),dest)
    //    gulp.src(event.path)
    //    .pipe($.coffee())
    //    .pipe(gulp.dest(to))
    //});

    gulp.src([
        'app/scripts/{,*/}*.coffee'
    ])
    .pipe($.changed('.tmp/scripts',{extension:".js"}))
    .pipe($.coffee())
    .on('error',gutil.log)
    .pipe(gulp.dest('.tmp/scripts'))
});
//compass
gulp.task('compass',function(){
    var compassConfig = {
        //debug: true,
        css:'.tmp/styles',
        sass: 'app/styles',
        config_file:'config.rb',
        relative:false
    }
    gulp.src([
        'app/styles/{,*/}*.{sass,scss}'
    ])
    .pipe($.changed('.tmp/styles',{extension:".css"}))
    .pipe($.compass(compassConfig))
    .on('error',gutil.log)
    .pipe(gulp.dest('.tmp/styles'));
});
//jade
gulp.task('jade',function(){
    var jadeConfig = {
        pretty:true
    }
    gulp.src([
        'app/jade/{,*/}*.jade',
    ])
    .pipe($.changed('.tmp',{extension:".jade"}))
    .pipe($.jade(jadeConfig))
    .on('error',gutil.log)
    .pipe(gulp.dest('.tmp'));
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

//gulp.task('serve', ['connect'], function () {
//    //require('opn')('http://localhost:9000');
//    gutil.log("dev serve is on http://localhost:9000");
//});
// inject bower components
gulp.task('wiredep', function () {
    var wiredep = require('wiredep').stream;

    gulp.src('app/*.html')
        .pipe(wiredep({
            directory: 'app/bower_components'
        }))
        .pipe(gulp.dest('app'));
});

gulp.task('watch',function(){
     
    gulp.watch(['app/scripts/{,*/}*.coffee']).on('change',function(event){
        gulp.start(['coffee']) 
    });
    gulp.watch(['app/styles/{,*/}*.sass']).on('change',function(event){
        gulp.start(['compass']) 
    });

    gulp.watch(['app/jade/{,*/}*.jade']).on('change',function(event){
        gulp.start(['jade']) 
    });

    var server = $.livereload();
    gulp.watch([
        'app/images/**/*',
        '.tmp/{,*/}*.html',
        '.tmp/scripts/{,*/}*.js',
        '.tmp/styles/{,*/}*.css',
        '.tmp/{,*/}*.html',
    ]).on("change",function(event){
        gutil.log(event.path);
        server.changed(event.path);
    });
});
gulp.task('serve', [
    'clean'
    ],function(){
        gulp.start([
            'coffee',
            'jade',
            'compass',
            'connect',
            'watch'
        ], function () {
            //console.log("QQ");
            //gulp.start('watch')
            //var server = $.livereload();
            //gutil.log("connect server is start")
            //gulp.start(['watch'])
            //// watch for changes
            //$.watch([
            //    //'app/*.html',
            //    //'.tmp/styles/**/*.css',
            //    //'app/scripts/**/*.js',
            //    'app/images/**/*',
            //    '.tmp/scripts/{,*/}*.js',
            //    '.tmp/styles/{,*/}*.css',
            //    '.tmp/{,*/}*.html',
            //]).on('change', function (file) {
            //    server.changed(file.path);
            //});
            //$.watch('app/scripts/{,*/}*.coffee', ['coffee'])
            //$.watch('app/styles/{,*/}*.{sass,scss}', ['compass'])
            //$.watch('app/jade/{,*/}*.jade', ['jade'])
            ////gulp.watch('app/styles/**/*.css', ['styles']);
            ////gulp.watch('app/scripts/**/*.js', ['scripts']);
            ////gulp.watch('app/images/**/*', ['images']);
            ////gulp.watch('bower.json', ['wiredep']);
        });
    }
);
