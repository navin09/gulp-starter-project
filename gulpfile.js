const { src, dest, watch, series, parallel } = require('gulp');
const sass = require('gulp-sass');
const postcss = require('gulp-postcss');
const cssnano = require('cssnano');
const terser = require('gulp-terser');
const clean = require('gulp-clean');
const notify = require('gulp-notify');
const rename = require('gulp-rename');
const browsersync = require('browser-sync').create();


// Sass Task
function scssTask(){
  return src('app/scss/style.scss', { sourcemaps: true })
    .pipe(notify('Starting SCSS Task'))
    .pipe(sass())
    .pipe(postcss([cssnano()]))
    .pipe(rename({
        suffix: '.min'
    }))
    .pipe(dest('dist', { sourcemaps: '.' }));
}

// JavaScript Task
function jsTask(){
  return src('app/js/script.js', { sourcemaps: true })
    .pipe(notify('Starting JS Task'))
    .pipe(terser())
    .pipe(dest('dist', { sourcemaps: '.' }));
}

// Clean task
function cleanTask() {
  return src('dist', { read: false })
    .pipe(notify('Starting Clean Task'))
    .pipe(clean());
}

// Browsersync Tasks
function browsersyncServe(cb){
  browsersync.init({
    server: {
      baseDir: '.'
    }
  });
  cb();
}

function browsersyncReload(cb){
  browsersync.reload();
  cb();
}

// Watch Task
function watchTask(){
  notify('Starting Watch Task');
  watch('*.html', browsersyncReload);
  watch(['app/scss/**/*.scss', ''], series(scssTask, browsersyncReload));
  watch('app/js/**/*.js', series(jsTask, browsersyncReload))
}

function buildTask(cb) {
  parallel(scssTask, jsTask)();
  cb();
}

exports.clean = cleanTask;
exports.build = buildTask;
// Default Gulp task
exports.default = series(
  parallel(scssTask, jsTask),
  browsersyncServe,
  watchTask
);