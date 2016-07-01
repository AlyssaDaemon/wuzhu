/* eslint no-console:off */
const fs     = require('fs');
const gulp   = require("gulp");
const sass   = require("gulp-sass");
const ugly   = require("gulp-uglify");
const maps   = require("gulp-sourcemaps");
const del    = require("del");
const lite   = require('lite-server');
const babel  = require('gulp-babel');
try{
  var config = require("./config.json");
} catch (e) {
  var config = {}
}
try {
  require("./scp");
} catch (e) {
  ;;//Do nothing if file doesn't exist. This is for me personally.
}

const paths = {
  sass: ["sass/**/*.scss"],
  js: ["js/**/*.js"],
  assets: ["assets/**/*"],
  vendor: [
    "bower_components/pouchdb/dist/pouchdb*.min.js",
    "bower_components/pouchdb-authentication/dist/pouchdb.authentication.min.js",
    "bower_components/showdown/dist/showdown.min.j*",
    "bower_components/webcomponentsjs/*.js",
    "bower_components/page/page.js"
  ],
  "cache": [
    "https://fonts.googleapis.com/icon?family=Material+Icons|Roboto:400,400i,700,700i|Product+Sans|Roboto+Mono"
  ]
};

gulp.task("clean", () => {
  return del(["build/**/*"]);
});

gulp.task("assets", ["clean"], () => {
  return gulp.src(paths.assets)
    .pipe(gulp.dest("build"));
});

gulp.task("sass", ["clean"], () => {
  return gulp.src(paths.sass)
    .pipe(maps.init())
    .pipe(sass({
      outputStyle: "compressed"
    }).on("error", sass.logError))
    .pipe(maps.write())
    .pipe(gulp.dest("build/css"))
});

gulp.task('sass:watch', () => {
  return gulp.watch(paths.sass, ['default']);
});
gulp.task('js:watch', () => {
  return gulp.watch(paths.js, ['default']);
});
gulp.task('assets:watch', () => {
  return gulp.watch(paths.assets, ['default']);
});
gulp.task('watch', ["default", "sass:watch", "js:watch", "assets:watch"]);
gulp.task('server', ["watch"], () => {
  return lite.server();
});

gulp.task("vendor", ["clean", "js"], () => {
  return gulp.src(paths.vendor, { base: "bower_components"})
    .pipe(gulp.dest("build/js/vendor"));
});

gulp.task("js", ["clean"], () => {
  return gulp.src(paths.js)
    .pipe(maps.init())
    .pipe(babel({
      presets: ['es2015']
    }))
    .pipe(ugly({
      screw_ie8: true
    }))
    .pipe(maps.write())
    .pipe(gulp.dest("build/js"));
})

gulp.task('config', ['clean'], (cb) => {
  fs.writeFile("build/config.js", `window.config = ${JSON.stringify(config)};`, cb)
})

gulp.task('sw', ['clean', 'vendor', 'sass', 'assets'], (cb) => {
  let glob = require('glob');
  let path = require('path');
  let fs   = require('fs');
  glob("**/*", {cwd: path.join(process.cwd(), "build"), nodir: true}, (err, files) => {
    if (err) {
      cb(err);
    }
    let cache = paths.cache;
    files.forEach(file => {
      cache.push(`/${file}`);
    });
    fs.readFile("assets/worker.js", (err,data)=> {
      // TODO: Work on the SW generator
      var top_matter =`const urlsToCache = ${JSON.stringify(cache)};\n`;
      if ('db_host' in config ){
        top_matter += `const blacklist_domains = ["${config.db_host}"];\n`  ;
      } else {
        top_matter += "const blacklist_domains = [];\n"
      }
      top_matter += `${data}`
      fs.writeFile("build/worker.js", top_matter, cb);
    })
  })
})

gulp.task("default", ["assets", "sass", "js", "vendor", "sw", "config"]);