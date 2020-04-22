const { src, watch, series, task, dest, parallel } = require('gulp');
const ts = require('gulp-typescript');
const tsProject = ts.createProject('./tsconfig.json');
const sourcemaps = require('gulp-sourcemaps');
const rollup = require('rollup');
const rollupTypescript = require('@rollup/plugin-typescript');
const rollupResolve = require('@rollup/plugin-node-resolve');
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

/**
 * Compile typescript from media-src directory
 */
async function media_typescript(cb) {
    const list = [
        "herolist_editor.ts",
        "nettable_editor.ts",
        "addoninfo_editor.ts",
    ];

    for(let filename of list) {
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

    cb();
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
	watch('media-src/**/*.ts', {ignoreInitial: false}, series(media_typescript));
});

task('build-sass', series(media_sass));

task('watch-sass', () => {
	watch('media-src/**/*.scss', {ignoreInitial: false}, series(media_sass));
});

task('build', parallel('build-ts', 'build-media', 'build-sass'), (done) => done());
task('watch', parallel('watch-ts', 'watch-media', 'watch-sass'), (done) => done());