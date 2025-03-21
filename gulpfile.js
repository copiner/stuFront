
const { src, dest, task, series, parallel, watch, lastRun } = require('gulp');
const connect = require('gulp-connect');
const plumber = require("gulp-plumber");
const proxy = require('http-proxy-middleware');
const del = require('del');


task('html', function (cb) {
    src('src/*.html')
        .pipe(plumber())
        .pipe(dest('dist/'))
        .pipe(connect.reload());
    cb();
});

task("lib", function (cb) {
    src("src/lib/*")
        .pipe(plumber())
        .pipe(dest("dist/lib"));
    cb();
});

task("util", function (cb) {
    src("src/util/*")
        .pipe(plumber())
        .pipe(dest("dist/util"));
    cb();
});

task("image", function (cb) {
    src("src/imgs/*",{encoding: false})
        .pipe(plumber())
        .pipe(dest("dist/imgs"));
    cb();
});

task('watch', function(cb){//监控

    let watcher = watch(
        ['src/**/*'],
        {events:['change','add','unlink']},
        parallel('html')
    );

    watcher.on('change', function(path, stats) {
        console.log(`
      ------------------------
      File ${path} was changed
      ------------------------
      `);
    });

    watcher.on('add', function(path, stats) {
        console.log(`
      ----------------------
      File ${path} was added
      ----------------------
      `);
    });

    watcher.on('unlink', function(path, stats) {
        console.log(`
      ------------------------
      File ${path} was removed
      ------------------------
      `);
    });

    cb();
});


task('clean', () => {
    return del('./dist').then(() => {
        console.log(`
        -----------------------------
          clean tasks are successful
        -----------------------------`);
    }).catch((e) =>{
        console.log(e);
    })
});

task('build', series('clean','html','lib','util','image',function(cb){
    console.log(`
        -----------------------------
          clean tasks are successful
        -----------------------------`);
    cb();
}));

//开发环境
task('server',series('clean','html','lib','util','image','watch',function(){
    connect.server({
        root: 'dist',
        port: 3001,
        host:"127.0.0.1",
        livereload: true,
        middleware: function (connect, opt) {
            return [
                // 配置反向代理
                proxy('/lesson', {
                    target: 'http://127.0.0.1:3000',
                    changeOrigin: true,
                    pathRewrite: {
                        '^/api': ''
                    }
                })
            ];
        }
    });
    console.log(`
        -----------------------------
          server tasks are successful
        -----------------------------`);
}));
