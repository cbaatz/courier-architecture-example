var browserify = require('browserify');
var del        = require('del');
var gulp       = require('gulp');
var livereload = require('gulp-livereload');
var source     = require('vinyl-source-stream');
var watchify   = require('watchify');
var package    = require('./package.json');

var bundler = browserify();
bundler.add('./src/js/main.jsx');
bundler.transform('reactify', { es6: true });

var path = "./public";

gulp.task("default", ["watch", "html", "css", "js"]);
gulp.task("build", ["html", "css", "js"]);

gulp.task("watch", function () {
    var watcher = watchify(bundler);
    watcher.bundle();
    watcher.on("update",  bundleApp.bind(null, watcher));

    gulp.watch(package.paths.html, ["html"]);
    gulp.watch(package.paths.css,  ["css"]);
    gulp.watch(package.paths.css,  ["css"]);

    livereload.listen();
});

gulp.task("js", bundleApp.bind(null, bundler));

gulp.task("html", function () {
    return gulp.src(package.paths.html)
    .pipe(gulp.dest(path))
    .pipe(livereload());
});

gulp.task("css", function () {
    return gulp.src(package.paths.css)
    .pipe(gulp.dest(path))
    .pipe(livereload());
});

function bundleApp(bundler) {
    return bundler.bundle()
    .pipe(source('main.js'))
    .pipe(gulp.dest(path))
    .pipe(livereload());
}
