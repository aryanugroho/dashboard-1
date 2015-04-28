(function () {
    'use strict';

    var gulp = require('gulp');
    var minifyHTML = require('gulp-minify-html');
    var stripDebug = require('gulp-strip-debug');
    var uglify = require('gulp-uglify');
    var jshint = require('gulp-jshint');
    var changed = require('gulp-changed');
    var imagemin = require('gulp-imagemin');
    var autoprefix = require('gulp-autoprefixer');
    var rjs = require('gulp-requirejs');
    var minifyCSS = require('gulp-minify-css');
    var browserSync = require('browser-sync');
    var modRewrite = require('connect-modrewrite');
    var del = require('del');
    var reload = browserSync.reload;

    var concat = require('gulp-concat');
    var sourcemaps = require('gulp-sourcemaps');
    var ngAnnotate = require('gulp-ng-annotate');


    var paths = {
        "app": require('./bower.json').appPath || 'app',
        "dist": 'dist',
        "themes": 'themes',
        "js": ['app/scripts/*.js', 'app/scripts/**/*.js'],
        "vendor": 'app/lib/**/*',
        "vendorTheme": 'app/themes/**/lib/**/*',
        "css": 'app/themes/**/styles/**/*.css',
        "images": 'app/themes/**/images/**/*',
        "fonts": 'app/themes/**/styles/fonts/**/*',
        "html": 'app/**/*.html',
        "misc": 'app/*.{txt,htaccess,ico}',
        "themeDest": "dist/themes",
        "scripts": ['app/scripts/main.js','app/scripts/**/module.js', 'app/scripts/**/*.js']
    };

    var env = process.env.NODE_ENV || 'development';

    var host = {
        port: '9000',
        lrPort: '35729'
    };

    // Empties folders to start fresh
    gulp.task('clean', function (cb) {
        del(['dist/*','!dist/media'], cb);
    });

    // Actions with js-files from theme
    gulp.task('vendorTheme', ['clean'], function () {
        /**
         * Minify and uglify the custom scripts in folder 'scripts' in each theme
         */
        gulp.src('app/themes/**/scripts/**/*.js')
            .pipe(stripDebug())
            .pipe(uglify({mangle: false}))
            .pipe(gulp.dest(paths.themeDest));

        /**
         * copy vendor js from theme folder
         */
        return gulp.src(paths.vendorTheme)
            .pipe(gulp.dest(paths.themeDest));
    });

    //  task for compilling angular application scripts
    //  -------------------------------
     
    gulp.task('scripts', function () {
      return gulp.src(['app/scripts/main.js','app/scripts/**/module.js', 'app/scripts/**/*.js'])
        .pipe(sourcemaps.init())
        .pipe(concat('app.js'))
        .pipe(ngAnnotate())
        .pipe(uglify())
        .pipe(sourcemaps.write('./maps'))
        .pipe(gulp.dest(paths.dist+'/scripts'))
    })


    // copy vendor js 
    gulp.task('vendor', ['clean', 'vendorTheme'], function () {
        return gulp.src(paths.vendor)
            .pipe(gulp.dest(paths.dist + '/lib'));
    });

    // copy misc assets
    gulp.task('misc', ['clean'], function () {
        return gulp.src(paths.misc)
            .pipe(gulp.dest(paths.dist));
    });

    // Run JSHint 
    gulp.task('jshint', function () {
        gulp.src(paths.js)
            .pipe(jshint())
            .pipe(jshint.reporter(require('jshint-stylish')));
    });



    // gulp.task('requirejs', ['clean'], function () {
    //     rjs({
    //         out: 'main.js',
    //         name: 'main',
    //         preserveLicenseComments: false, // remove all comments
    //         removeCombined: true,
    //         paths: {
    //             "tinymce" : "empty:"
    //         },
    //         baseUrl: paths.app + '/scripts',
    //         mainConfigFile: 'app/scripts/main.js'
    //     })
    //         .pipe(stripDebug())
    //         .pipe(uglify({mangle: false}))
    //         .pipe(gulp.dest(paths.dist + '/scripts/'));
    // });

    // minify new images
    gulp.task('imagemin', ['clean'], function () {
        return gulp.src(paths.images)
            .pipe(changed(paths.themeDest))
            .pipe(imagemin())
            .pipe(gulp.dest(paths.themeDest));
    });

    // minify new or changed HTML pages
    gulp.task('html', ['clean'], function () {
        return gulp.src(paths.html)
            .pipe(changed(paths.dist))
            .pipe(minifyHTML({
                collapseWhitespace: true,
                collapseBooleanAttributes: true,
                removeCommentsFromCDATA: true,
                removeOptionalTags: true,
                conditionals: true,
                quotes: true,
                empty: true
            }))
            .pipe(gulp.dest(paths.dist));
    });

    // CSS auto-prefix and minify
    gulp.task('autoprefixer', ['clean'], function () {
        gulp.src(paths.css)
            .pipe(autoprefix('last 2 version', 'safari 5', 'ie 8', 'ie 9', 'opera 12.1', 'ios 6', 'android 4'))
            .pipe(minifyCSS())
            .pipe(gulp.dest(paths.themeDest));
        gulp.src(paths.fonts)
            .pipe(gulp.dest(paths.themeDest));
    });

    // gulp.task('html-watch', ['html'], reload);
    
    // gulp.task('express', function(){
    //     var express = require('express'),
    //     app = express(),
    //     path = require('path');
        
    //     if (env == 'development'){
    //         app.use(require('connect-livereload')());
    //     }

    //     app.use(express.static(path.join(__dirname, 'dist')));

    //     app.listen(host.port, function(){
    //         console.log('server started, port %s',host.port);
            
    //         refresh.listen({ basePath: 'dist' });
    //     })
    // });

    // gulp.task('serve', ['build','browser-sync','watch']);
    
    
    gulp.task('watch', function(){
        // gulp.watch(["app/**/*.html"],[]);
        // gulp.watch(["app/**/*.css"],[]);
        // gulp.watch(["app/**/*.js"],[]);
    })
    


    gulp.task('build', ['scripts', 'vendor', 'misc', 'html', 'autoprefixer', 'imagemin']);

    gulp.task('default',['build']);

})();
