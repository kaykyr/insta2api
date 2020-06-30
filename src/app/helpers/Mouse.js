import rand from './Rand'
import sleep from './Sleep'

export default class Mouse {
	constructor(instagram) {
		this.instagram = instagram
	}

	click = async (target) => {
		await this.instagram.waitForSelector(target)

		var inContext = await this.instagram.$(target)
		while (inContext === null) {
			inContext = await this.instagram.$(target)
		}

		await sleep(rand(1500, 2000))

		var clicked = false

		while (!clicked) {
			try {
				clicked = true
				await this.instagram.click(target)
			} catch (e) {
				clicked = false
			}
		}
	}

	clickIfContext = async (context) => {
		await sleep(rand(1500, 2000))
		const inContext = await this.instagram.$(context)
		if (inContext !== null) this.click(context)
	}
}
