var browserify = require('browserify');
var del        = require('del');
var gulp       = require('gulp');
var livereload = require('gulp-livereload');
var source     = require('vinyl-source-stream');
var watchify   = require('watchify');
var package    = require('package.json');

var bundler = browserify();
bundler.add('./src/js/main.jsx');
bundler.transform('reactify', { es6: true });

gulp.task("build", function () {
    var path = './dist';
    del.sync(path);

    writeJS(path, bundler);
    writeHTML(path);
    writeCSS(path);
});

gulp.task("watch", function () {
    var path = "./public";
    del.sync(path);
    bundler = watchify(bundler);

    bundler.on("update", function () {
        writeJS(path, bundler).pipe(livereload());
    });
    gulp.watch(package.paths.html, function () {
        writeHTML(path).pipe(livereload());
    });
    gulp.watch(package.paths.css, function () {
        writeCSS(path).pipe(livereload());
    });

    writeJS(path, bundler);
    writeHTML(path);
    writeCSS(path);

    livereload.listen();
});

function writeJS (path, bundler) {
    return bundler.bundle()
        .pipe(source('main.js'))
        .pipe(gulp.dest(path));
}

function writeHTML (path) {
    return gulp.src(package.paths.html)
        .pipe(gulp.dest(path));
}

function writeCSS (path) {
    return gulp.src(package.paths.css)
        .pipe(gulp.dest(path));
}
