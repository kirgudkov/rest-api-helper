const style = Object.freeze({
	thin: 'font-weight: 100; color: #888',
	grey: 'color: #aaa',
	blue: 'color: #3399FF; font-weight: 600',
	green: 'color: #33CC66; font-weight: 600',
	red: 'color: #FF3300; font-weight: 600',
	greyBold: 'color: #aaa; font-weight: 600',
});

export class Logger {

	static setOption(option) {
		this._option = option;
	}

	static log(message, log, options) {
		if (this._option) {
			try {
				console.groupCollapsed('%c action', style.thin, message);
				for (let i in log) {
					console.log(` %c${Logger.getTitle(i)}`, style[options] || style.greyBold, log[i]);
				}
				console.groupEnd();
			}
			catch (e) {
				//that's okay, logs doesn't supported js engine
			}
		}
	}

	static getTitle(str) {

		let length = str.length;
		let title = str;

		if (length < 10) {
			for (let i = 0; i < 10 - length; i++) {
				title += ' ';
			}
		}

		return title;
	}
}
