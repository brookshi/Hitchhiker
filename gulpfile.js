var gulp = require('gulp'),
    argv = require('yargs').argv,
    replace = require('gulp-replace'),
    exec = require('child_process').exec,
    fs = require('fs-extra'),
    path = require('path'),
    archiver = require('archiver');

gulp.task('build', ['copyTemplate', 'copyGlobalData']);

gulp.task('package', ['release'], function () {
    const keepFiles = ['build', 'node_modules', 'appconfig.json', 'gulpfile.js', 'logconfig.json', 'mail.json', 'pm2.json', 'sample collection.json', 'tsconfig.json'];
    const files = fs.readdirSync(__dirname);
    files.forEach(f => {
        if (!keepFiles.find(f)) {
            fs.removeSync(f)
        }
    });

    const zipPath = __dirname;
    const zipFile = `${zipPath}.zip`;
    if (fs.existsSync(zipFile)) {
        fs.unlinkSync(zipFile);
    }

    const output = fs.createWriteStream(zipFile);
    const archive = archiver('zip');
    let isClose = false;

    output.on('close', () => {
        isClose = true;
    });
    output.on('end', () => {
        isClose = true;
    });

    archive.pipe(output);
    archive.directory(zipPath, false);
    archive.finalize();
});

gulp.task('release', ['copy', 'copyTemplate', 'copyGlobalData']);

gulp.task('copy', ['compilerClient'], function () {
    return gulp.src('./client/build/**/*.*')
        .pipe(gulp.dest('./build/public'));
});

gulp.task('copyTemplate', function () {
    fs.removeSync(path.join(__dirname, 'build/mail/templates'));
    return gulp.src('./api/mail/templates/**/*.*')
        .pipe(gulp.dest('./build/mail/templates'));
});

gulp.task('copyGlobalData', function () {
    fs.removeSync(path.join(__dirname, 'build/global_data'));
    return gulp.src('./api/global_data/**/*.*')
        .pipe(gulp.dest('./build/global_data'));
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
    return gulp.src('./client/src/utils/urls.ts')
        .pipe(replace('http://localhost:3000/', 'HITCHHIKER_APP_HOST'))
        .pipe(gulp.dest('./client/src/utils/'))
        .on('end', function () {
            gulp.src('./appconfig.json')
                .pipe(replace('localhost:3000', `localhost:8080`))
                .pipe(replace('localhost:81', `localhost:8080`))
                .pipe(replace('"database": "hitchhiker"', '"database": "hitchhiker-prod"'))
                .pipe(replace('DEV', `PROD`))
                .pipe(gulp.dest('./'))
                .on('end', function () {
                    gulp.src('./client/package.json')
                        .pipe(replace('localhost:81', `localhost:8080`))
                        .pipe(gulp.dest('./client/'));
                });
        });
});