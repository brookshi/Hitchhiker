var gulp = require('gulp'),
    exec = require('child_process').exec,
    clean = require('gulp-clean');

gulp.task('copy', ['clean'], function () {
    return gulp.src('./api/public/**/*.*')
        .pipe(gulp.dest('./build/public'));
});

gulp.task('clean', function () {
    return gulp.src('./build/public/*.*', {
            read: false
        })
        .pipe(clean());
});