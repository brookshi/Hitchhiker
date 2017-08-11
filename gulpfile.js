var gulp = require('gulp'),
    clean = require('gulp-clean'),
    argv = require('yargs').argv,
    replace = require('gulp-replace'),
    exec = require('child_process').exec;

gulp.task('release', ['copy']);

gulp.task('copy', ['clean'], function () {
    gulp.src('./client/build/**/*.*')
        .pipe(gulp.dest('./build/public'));
});

gulp.task('clean', ['compilerClient'], function () {
    return gulp.src('./build/public/*.*', {
            read: false
        })
        .pipe(clean());
});

gulp.task('compilerClient', ['compilerServer'], function (cb) {
    process.chdir('./client');
    exec('yarn build', function (err, stdout, stderr) {
        console.log(stdout);
        console.log(stderr);
        process.chdir('../');
        cb();
    });
});

gulp.task('compilerServer', ['config'], function (cb) {
    exec('tsc -p . -w false', function (err, stdout, stderr) {
        console.log(stdout);
        console.log(stderr);
        cb();
    });
});

gulp.task('config', [], function () {
    gulp.src('./client/src/utils/urls.ts')
        .pipe(replace('http://localhost:3000/', 'HITCHHIKER_APP_HOST'))
        .pipe(gulp.dest('./client/src/utils/'));
    gulp.src('./appconfig.json')
        .pipe(replace('localhost:3000', `localhost:8080`))
        .pipe(replace('localhost:81', `localhost:8080`))
        .pipe(replace('"database": "hitchhiker"', '"database": "hitchhiker-prod"'))
        .pipe(replace('DEV', `PROD`))
        .pipe(gulp.dest('./'));
    gulp.src('./client/package.json')
        .pipe(replace('localhost:81', `localhost:8080`))
        .pipe(gulp.dest('./client/'));
    gulp.src('./api/index.ts')
        .pipe(replace('81', `8080`))
        .pipe(gulp.dest('./api/'));
});