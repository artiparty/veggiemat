const gulp = require('gulp');
const postcss = require('gulp-postcss');
const browserSync = require('browser-sync');
const del = require('del');
const rename = require('gulp-rename');
const header = require('gulp-header');
const cssnano = require('cssnano');
const stylelint = require('gulp-stylelint');
const eslint = require('gulp-eslint');
const rev = require('gulp-rev');
const revReplace = require('gulp-rev-replace');

const project = {
	src: 'dev',
	build: 'build',
	css: {
		src: 'dev/pcss/main.pcss',
		build: 'main.css',
		dir: 'dev/pcss',
	},
	js: {
		src: 'dev/js',
		build: 'build/js',
	},
	img: {
		src: 'dev/img',
		build: 'build/img',
		allExtensions: '**/*.{png,jpg,gif,svg}',
	},
};

function handleError(err) {
	console.log(err.toString()); // eslint-disable-line no-console
	this.emit('end');
}

gulp.task('clean', function() {
	return del([`${project.build}/**/*`], {
		dot: true,
	});
});

const processors = [
	require('postcss-import')(),
	require('postcss-mixins')(),
	require('postcss-nested')(),
	require('postcss-simple-vars')(),
	require('postcss-property-lookup')(),
	require('postcss-assets')({
		basePath: 'dev',
	}),
	require('postcss-inline-svg')({
		path: 'dev',
	}),
	require('postcss-calc')(),
	require('postcss-hexrgba')(),
	require('postcss-custom-media')(),
	require('postcss-media-minmax')(),
	require('autoprefixer')({
		browsers: ['last 2 major versions', '>1%', 'not dead', 'not ie 11'],
	}),
];

gulp.task('styles:default', function() {
	return gulp
		.src(project.css.src)
		.pipe(postcss(processors))
		.on('error', handleError)
		.pipe(rename(project.css.build))
		.pipe(gulp.dest(project.build))
		.pipe(browserSync.stream());
});

gulp.task('styles:minify', function() {
	return gulp
		.src(`${project.build}/${project.css.build}`)
		.pipe(
			postcss([
				cssnano({
					preset: [
						'default',
						{
							cssDeclarationSorter: false, // could have problems with incorrect sorting
							mergeLonghand: false,
							svgo: false, // removes viewBox
						},
					],
				}),
			])
		)
		.on('error', handleError)
		.pipe(gulp.dest(project.build));
});

gulp.task('styles:lint', function() {
	return gulp.src(`${project.css.dir}/*.pcss`).pipe(
		stylelint({
			failAfterError: false,
			reporters: [
				{
					formatter: 'string',
					console: true,
				},
			],
		})
	);
});

gulp.task('styles', gulp.series('styles:default', 'styles:minify'));

gulp.task('js:lint', function() {
	return gulp
		.src([`${project.js.src}/*.js`, './gulpfile.js'])
		.pipe(eslint())
		.pipe(eslint.format())
		.pipe(eslint.failAfterError());
});

gulp.task('copy:images', function() {
	return gulp
		.src([`${project.img.src}/${project.img.allExtensions}`], {
			since: gulp.lastRun('copy:images'),
		})
		.pipe(gulp.dest(project.img.build))
		.pipe(browserSync.stream());
});

gulp.task('copy:html', function() {
	return gulp
		.src(`${project.src}/*.html`, { since: gulp.lastRun('copy:html') })
		.pipe(gulp.dest(project.build))
		.pipe(browserSync.stream());
});

gulp.task('copy:js', function() {
	return gulp
		.src(`${project.js.src}/*.js`, { since: gulp.lastRun('copy:js') })
		.pipe(gulp.dest(project.js.build))
		.pipe(browserSync.stream());
});

gulp.task('copy', gulp.parallel('copy:images', 'copy:html', 'copy:js'));

gulp.task('rev', function() {
	return gulp
		.src([`${project.build}/*.css`, `${project.build}/{js,img}/**/*`])
		.pipe(rev())
		.pipe(gulp.dest(project.build))
		.pipe(rev.manifest())
		.pipe(gulp.dest(project.build));
});

gulp.task('revreplace', function() {
	const manifest = gulp.src(`${project.build}/rev-manifest.json`);

	return gulp
		.src(`${project.build}/*.html`)
		.pipe(revReplace({ manifest }))
		.pipe(gulp.dest(project.build));
});

gulp.task('banner', function() {
	return gulp
		.src(`${project.build}/${project.css.build}`)
		.pipe(
			header(
				'/*\n' +
					'Author:     Aleks Hudochenkov (hudochenkov.com)\n' +
					'Version:    <%= date %>\n' +
					'-----------------------------------------------------------------------------*/\n',
				{
					date: new Date()
						.toJSON()
						.slice(0, 10)
						.split('-')
						.reverse()
						.join('.'),
				}
			)
		)
		.pipe(gulp.dest(project.build));
});

gulp.task('server', function() {
	browserSync.init({
		server: {
			baseDir: project.build,
		},
		notify: false,
		online: false,
		ghostMode: false,
	});
});

gulp.task('watch', function() {
	gulp.watch([`${project.css.dir}/*.pcss`], gulp.series('styles:default'));

	gulp.watch([`${project.img.src}/${project.img.allExtensions}`], gulp.series('copy:images'));

	gulp.watch([`${project.js.src}/*.js`], gulp.series('copy:js'));

	gulp.watch([`${project.src}/*.html`], gulp.series('copy:html'));
});

gulp.task(
	'default',
	gulp.series(gulp.parallel('styles:default', 'copy'), gulp.parallel('server', 'watch'))
);

gulp.task(
	'build',
	gulp.series(
		'clean',
		gulp.parallel(gulp.series('styles:default', 'styles:minify', 'banner'), 'copy'),
		'rev',
		'revreplace'
	)
);

gulp.task('lint', gulp.parallel('styles:lint', 'js:lint'));
