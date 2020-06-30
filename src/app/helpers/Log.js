export default class Log {
	constructor(session) {
		this.session = session
	}

	text = (text) => {
		console.log(`[${this.session}] - ${text}`)
	}
}
