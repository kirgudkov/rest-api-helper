import {getCurl} from './utils';

const style = Object.freeze({
	thin: 'font-weight: 100; color: #888; font-size: 10px;',
	grey: 'color: #aaa',
	blue: 'color: #3474e8; font-weight: 600',
	green: 'color: #2fa73c; font-weight: 600',
	red: 'color: #EE4D46; font-weight: 600;',
	redBold: 'color: #EE4D46; font-weight: 600; font-size: 12px; line-height: 16px',
	greenBold: 'color: #2fa73c; font-weight: 600; font-size: 12px; line-height: 16px',
	greyBold: 'color: #aaa; font-weight: 600',
	blackBold: 'color: #333; font-weight: 600; font-size: 12px; line-height: 16px',
});

export class Logger {

	static setOption(option) {
		this._option = option;
	}

	static error(message, log, options, tag) {
		if (this._option) {
			Logger.log(message, log, options, tag, style.redBold);
		}
	}

	static success(message, log, options, tag) {
		if (this._option) {
			Logger.log(message, log, options, tag, style.greenBold);
		}
	}

	static info(message, log, options, tag) {
		if (this._option) {
			Logger.log(message, log, options, tag, style.blackBold);
		}
	}

	static log(message, log, options, tag, titleStyle) {
		try {
			const date = new Date()
			console.groupCollapsed(`%c ${message} %c @ ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}.${date.getMilliseconds()}`, titleStyle, style.thin);
			for (let i in log) {
				console.log(` %c${Logger.getTitle(i)}`, style[options] || style.greyBold, log[i]);
			}
			if (log.method) {
				const curl = getCurl(log);
				console.groupCollapsed('%c curl', style.greyBold);
				console.log(curl);
				console.groupEnd();
			}
			console.groupEnd();
		} catch (e) {
			console.log(e);
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
