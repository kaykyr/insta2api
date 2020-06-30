import rand from './Rand'
import sleep from './Sleep'

export default class Keyboard {
	constructor(instagram) {
		this.instagram = instagram
	}

	type = async (text) => {
		await sleep(rand(1500, 2000))
		const letters = text.split()

		await sleep(1000, 1500)

		const type = letters.map(async (letter) => {
			let delay = rand(30, 100)
			await this.instagram.keyboard.type(letter, { delay })
		})

		await Promise.all(type)
	}
}
