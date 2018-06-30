export class Logger {

	static style = Object.freeze({
		bold: 'font-weight: 600',
		red: 'color: red',
		blue: 'color: blue',
	});

	static setOption(option) {
		this._option = option;
	}

	static log(message, style = '') {
		this._option && console.log('%c'+message, style);
	}
}