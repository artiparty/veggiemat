module.exports = {
	printWidth: 100,
	tabWidth: 4,
	useTabs: true,
	semi: true,
	singleQuote: true,
	trailingComma: 'es5',
	overrides: [
		{
			files: '*.pcss',
			options: {
				singleQuote: false,
			},
		},
	],
};
