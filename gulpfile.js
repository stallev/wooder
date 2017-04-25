'use strict';

var gulp = require('gulp');
var sass = require('gulp-sass');
var plumber = require('gulp-plumber');
var postcss = require('gulp-postcss');
var autoprefixer = require('autoprefixer');
var server = require('browser-sync').create();
var csso = require('gulp-csso');
var gulpMerge = require('merge2');
var cssComb = require('gulp-csscomb');
var spritesmith = require('gulp.spritesmith');
var imagemin = require('gulp-imagemin');
var run = require('run-sequence');
var del = require('del');
var rename = require('gulp-rename');
var ghPages = require('gulp-gh-pages');

gulp.task('style', function() {
  gulp.src('sass/style.scss')
    .pipe(plumber())
    .pipe(sass())
    .pipe(postcss([
      autoprefixer({browsers: [
        'last 2 versions'
      ]})
    ]))
    .pipe(cssComb())
    .pipe(gulp.dest('build/css'))
    .pipe(csso())
    .pipe(rename('style.min.css'))
    .pipe(gulp.dest('build/css'))
    .pipe(server.stream());
});

gulp.task('serve', ['style'], function() {
  server.init({
    server: 'build',
    notify: false,
    open: true,
    cors: true,
    ui: false
  });
  
  gulp.watch('sass/**/*.{scss,sass}', ['style']);
  gulp.watch('*.html', ['copyHtml']);
  gulp.watch('build/*.html').on('change', server.reload);
});

gulp.task('copy', function(){
  return gulp.src([
    'fonts/**/*.{woff,woff2}',
    'js/**',
    'img/*.svg',
    '*.html'
  ], {
    base: '.'
  })
    .pipe(gulp.dest('build'));
});

gulp.task('sprite', function () {
  var spriteData = gulp.src('img/*.png').pipe(spritesmith({
    imgName: 'sprite.png',
    cssName: 'sprite.css'
  }));
  var imgStream = spriteData.img
    .pipe(gulp.dest('img/'));
  var cssStream = spriteData.css
    .pipe(gulp.dest('sass/global/'));
  return gulpMerge(imgStream, cssStream);
});

gulp.task('copyBootstrapJS', function(){
  return gulp.src(['node_modules/bootstrap-sass/assets/javascripts/*.js'])
    .pipe(gulp.dest('build/js'));
});

gulp.task('clean', function(){
  return del('build/img');
});

gulp.task('copyHtml', function(){
  return gulp.src(['*.html'], {base: '.'})
    .pipe(gulp.dest('build'));
});

gulp.task('images', function() {
  return gulp.src('img/**/*.{jpg,png,gif}')
    .pipe(imagemin([
      imagemin.optipng({optimizationLevel: 3}),
      imagemin.jpegtran({progressive: true})
    ]))
    .pipe(gulp.dest('build/img'));
});

gulp.task('build', function(fn){
  run('clean', 'copy', 'copyBootstrapJS', 'images', 'style', fn);
});

gulp.task('server', function(){
  run('build', 'serve');
});
gulp.task('deploy', function() {
  return gulp.src('build/**/*')
    .pipe(ghPages());
});
