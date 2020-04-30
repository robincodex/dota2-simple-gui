const { src, watch, series, task, dest, parallel } = require('gulp');
const ts = require('gulp-typescript');
const tsProject = ts.createProject('./tsconfig.json');
const sourcemaps = require('gulp-sourcemaps');
const rollup = require('rollup');
const rollupTypescript = require('@rollup/plugin-typescript');
const rollupResolve = require('@rollup/plugin-node-resolve');
const path = require("path");
const sass = require('gulp-sass');
sass.compiler = require('node-sass');

/**
 * Compile typescript from src directory
 */
function typescript(cb) {
    tsProject.src()
    .pipe(sourcemaps.init())
    .pipe(tsProject()).js
    .pipe(sourcemaps.write('.'))
    .pipe(dest('out'))
    .on('finish', cb);
}

const mediaTslist = [
    "herolist_editor.ts",
    "nettable_editor.ts",
    "addoninfo_editor.ts",
    "soundevents_editor.ts",
];

/**
 * Compile typescript from media-src directory
 */
async function media_typescript(cb) {
    for(let filename of mediaTslist) {
        await media_typescript_single_file(filename);
    }
    cb();
}

async function media_typescript_single_file(filename) {
    const heroEdtiorBundle = await rollup.rollup({
        input: `./media-src/${filename}`,
        plugins: [
            rollupResolve(),
            rollupTypescript({tsconfig: 'tsconfig_media.json'}),
        ]
    });
    await heroEdtiorBundle.write({
        file: `./media/${filename.replace(".ts", ".js")}`,
        format: 'cjs',
        sourcemap: true
    });
}

/**
 * Compile sass from media-src directory
 */
function media_sass(cb) {
    src('./media-src/**/*.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(dest('./media'))
    .on('finish', cb);
}

task('build-ts', series(typescript));

task('watch-ts', () => {
	watch('src/**/*.ts', {ignoreInitial: false}, series(typescript));
});

task('build-media', series(media_typescript));

task('watch-media', () => {
    let first = true;
    function watch_media_ts(cb) {
        if (first) {
            first = false;
            media_typescript(cb);
        } else {
            cb();
        }
    }
    watch('media-src/**/*.ts', {ignoreInitial: false}, watch_media_ts)
    .on('change', (file) => {
        const filename = path.basename(file);
        if (mediaTslist.includes(filename)) {
            media_typescript_single_file(filename);
        }
    });
});

task('build-sass', series(media_sass));

task('watch-sass', () => {
	watch('media-src/**/*.scss', {ignoreInitial: false}, series(media_sass));
});

task('build', parallel('build-ts', 'build-media', 'build-sass'), (done) => done());
task('watch', parallel('watch-ts', 'watch-media', 'watch-sass'), (done) => done());