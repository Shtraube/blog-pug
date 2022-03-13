const gulp = require('gulp');
const browserSync = require('browser-sync').create();
const watch = require('gulp-watch');
const scss = require('gulp-sass')(require('sass'));
const autoprefixer = require('gulp-autoprefixer');
const sourcemaps = require('gulp-sourcemaps');
const plumber = require('gulp-plumber');
const notify = require('gulp-notify');
const gcmq = require('gulp-group-css-media-queries');
const sassGlob = require('gulp-sass-glob');
const pug = require('gulp-pug');
const del = require('del');

// Задача для сборки pug-файлов
gulp.task('pug', function (callback) {
    return gulp
        .src('./src/pug/pages/**/*.pug')
        .pipe(
            plumber({
                errorHandler: notify.onError(function (err) {
                    return {
                        title: 'Pug',
                        sound: false,
                        message: err.message,
                    };
                }),
            })
        )
        .pipe(
            pug({
                pretty: true, // нормальное форматирование
            })
        )
        .pipe(gulp.dest('./build'))
        .pipe(browserSync.stream());
    callback();
});

// задача для компиляции scss в css
gulp.task('scss', function (callback) {
    return gulp
        .src('./src/scss/**/*.scss')
        .pipe(
            plumber({
                errorHandler: notify.onError(function (err) {
                    return {
                        title: 'SCSS styles',
                        sound: false,
                        message: err.message,
                    };
                }),
            })
        )
        .pipe(sourcemaps.init())
        .pipe(sassGlob())
        .pipe(
            scss({
                indentType: 'tab',
                indentWidth: 1,
                outputStyle: 'expanded', // форматирование работало и без этой инструкции
            })
        )
        .pipe(gcmq())
        .pipe(
            autoprefixer({
                overrideBrowserlist: ['last 4 versions'],
            })
        )
        .pipe(sourcemaps.write())
        .pipe(gulp.dest('./build/css/'))
        .pipe(browserSync.stream());
    callback();
});

// задача для копирования изображений
gulp.task('copy:img', function (callback) {
    return gulp.src('./src/img/**/*.*')
        .pipe(gulp.dest('./build/img'));
    callback();
});

// задача для копирования скриптов
gulp.task('copy:js', function (callback) {
    return gulp.src('./src/js/**/*.*')
        .pipe(gulp.dest('./build/js'));
    callback();
});

// задача для отслеживания изменений файлов и обновления браузера
gulp.task('watch', function () {

    watch(['./build/js/**/*.*', './build/img/**/*.*'], gulp.parallel(browserSync.reload));

    // слежение с задержкой
    watch('./src/scss/**/*.scss', function () {
        setTimeout(gulp.parallel('scss'), 1000);
    });

    watch('./src/pug/**/*.pug', gulp.parallel('pug'));
    watch('./src/img/**/*.*', gulp.parallel('copy:img'));
    watch('./src/js/**/*.*', gulp.parallel('copy:js'));
});

// задача для старта сервера из папки build
gulp.task('server', function () {
    browserSync.init({
        server: {
            baseDir: './build/',
        },
    });
});

//Задача по очистке скомпилированного проекта

gulp.task('clean:build', function () {
    return del('./build');
});

//Задача по умолчанию. Общий старт

gulp.task('default', gulp.series(
    gulp.parallel('clean:build'),
    gulp.parallel('scss', 'pug', 'copy:img', 'copy:js'),
    gulp.parallel('server', 'watch')
));