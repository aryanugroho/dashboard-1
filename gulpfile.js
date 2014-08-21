(function () {
    "use strict";

    var gulp = require("gulp"),
        lr = require("tiny-lr"),
        livereload = require("gulp-livereload"),
        connect = require("connect"),
        minifyHTML = require("gulp-minify-html"),
        concat = require("gulp-concat"),
        stripDebug = require("gulp-strip-debug"),
        uglify = require("gulp-uglify"),
        jshint = require("gulp-jshint"),
        changed = require("gulp-changed"),
        imagemin = require("gulp-imagemin"),
        autoprefix = require("gulp-autoprefixer"),
        sass = require("gulp-sass"),
        rjs = require("gulp-requirejs"),
        minifyCSS = require("gulp-minify-css"),
        protractor = require("gulp-protractor"),
        jasmine = require("gulp-jasmine"),
        rimraf = require("rimraf"),
        server = lr();

    //File sources
    var sources = {
        app: require("./bower.json").appPath || "./app",
        js: ["./app/scripts/*.js", "./app/scripts/**/*.js"],
        dist: "./dist",
        port: 9000,
        liveReloadPort: 35729
    };

    // Empties folders to start fresh
    gulp.task("clean", function () {
        rimraf.sync(sources.dist + "/*");
    });

    gulp.task("copy", function () {
        gulp.src([
                sources.app + "/*.{ico,png,txt}",
                sources.app + "/.htaccess"
            ]).pipe(gulp.dest(sources.dist));
    });

    // Compiling sass to css
    gulp.task("sass", function () {
        return gulp.src(sources.app + "/styles/sass/*.scss")
            .pipe(sass({
            imagePath: "../../images"
        }))
            .pipe(autoprefix("last 1 version"))
            .pipe(gulp.dest(sources.dist + "/styles/"))
            .pipe(gulp.dest(sources.app + "/styles/"));
    });

    // concatentates all js into one file and vendor files into lib
    gulp.task("js", function() {
        gulp.src(sources.js)
        .pipe(concat("main.js"))
        .pipe(uglify({mangle: false}))
        .pipe(gulp.dest(sources.dist + "/scripts/"));
        gulp.src(sources.app + "/lib/**/*")
        .pipe(gulp.dest(sources.dist + "/lib/"));
    });

    // JSHint task
    gulp.task("jshint", function () {
        gulp.src(sources.app + "/scripts/**/**/*.js")
            .pipe(jshint())
            .pipe(jshint.reporter(require("jshint-stylish")));
    });

    // Serve
    gulp.task("serve", function () {
        connect()
            .use(require("connect-livereload")())
            .use(connect.static(sources.app))                           // jshint ignore:line
            .listen(sources.port);
        server.setMaxListeners(100);

        console.log("Server listening on http://localhost:" + sources.port);
    });

    // serve site from dist folder for testing production
    gulp.task("dist-test", function () {
        connect()
            .use(require("connect-livereload")())
            .use(connect.static(sources.dist))                          // jshint ignore:line
            .listen(sources.port);
        server.setMaxListeners(0);

        console.log("Server listening on http://localhost:" + sources.port);
    });

    // minify new images
    gulp.task("imagemin", function () {
        var imgSrc = sources.app + "/images/**/*",
            imgDst = sources.dist + "/images";

        gulp.src(imgSrc)
            .pipe(changed(imgDst))
            // .pipe(imagemin())
            .pipe(gulp.dest(imgDst));
    });

    // minify new or changed HTML pages
    gulp.task("htmlpage", function () {
        var htmlSrc = sources.app + "/**/*.html",
            htmlDst = sources.dist;

        gulp.src(htmlSrc)
            .pipe(changed(htmlDst))
            .pipe(minifyHTML({
                collapseWhitespace: true,
                collapseBooleanAttributes: true,
                removeCommentsFromCDATA: true,
                removeOptionalTags: true,
                conditionals: true,
                quotes: true,
                empty: true
            }))
            .pipe(gulp.dest(htmlDst));
    });

    // CSS concat, auto-prefix and minify
    gulp.task("autoprefixer", ["sass"], function () {
        gulp.src([sources.app + "/styles/*.css"])
            .pipe(concat("main.css"))
            .pipe(autoprefix("last 2 version", "safari 5", "ie 8", "ie 9", "opera 12.1", "ios 6", "android 4"))
            .pipe(minifyCSS())
            .pipe(gulp.dest(sources.dist + "/styles/"));
        gulp.src([sources.app + "/styles/font-awesome/*"])
            .pipe(concat("font-awesome.css"))
            .pipe(autoprefix("last 2 version", "safari 5", "ie 8", "ie 9", "opera 12.1", "ios 6", "android 4"))
            .pipe(minifyCSS())
            .pipe(gulp.dest(sources.dist + "/styles/font-awesome/"));
    });


    gulp.task("requirejs", ["jshint"], function () {
        rjs({
            out: "main.js",
            name: "main",
            preserveLicenseComments: false, // remove all comments
            removeCombined: true,
            baseUrl: sources.app + "/scripts",
            mainConfigFile: sources.app + "/scripts/main.js"
        })
            .pipe(stripDebug())
            .pipe(uglify({mangle: false}))
            .pipe(gulp.dest(sources.dist + "/scripts/"));
    });

    // Watch Files For Changes
    gulp.task("watch", function () {
            server.listen(sources.liveReloadPort, function (err) {
                if (err) {
                    return console.log(err);
                }

                gulp.watch(sources.app + "/**/*.html", { maxListeners:0 }, ["htmlpage"]);
                gulp.watch(sources.app + "/scripts/**/*.js", { maxListeners:0 }, ["jshint"]);
                gulp.watch(sources.app + "/images/**/*", { maxListeners:0  }, ["imagemin"]);
                gulp.watch(sources.app + "/styles/*.css", { maxListeners:0 }, ["autoprefixer"]);
                gulp.watch(sources.app + "/styles/sass/*.scss", {  maxListeners:0  }, ["sass"]);
            });
        }
    );

    // Protractor test
    gulp.task("protractorUpdate", protractor.webdriverUpdate);
    gulp.task("protractor", ["protractorUpdate"], function (cb) {
        gulp.src(["tests/e2e/**/*.js"]).pipe(protractor.protractor({
            configFile: "protractor.conf.js"
        })).on("error", function (e) {
            console.log(e);
        }).on("end", cb);
    });

    // Jasmine test
    gulp.task("jasmine", function() {
        gulp.src("spec/**/*.js")
            .pipe(jasmine({verbose:true, includeStackTrace: true}));
    });

    gulp.task("test", ["protractor", "jasmine"], function () {});

    gulp.task("build", ["clean", "copy", "htmlpage","autoprefixer", "requirejs", "imagemin"]);

    gulp.task("default",["build"]);
})();