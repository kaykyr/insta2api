import InstanceController from './InstanceController'

import sleep from '../helpers/Sleep'
import rand from '../helpers/Rand'

import Constants from '../../config/Constants'

class BehaviourController {
	async feedExplore(req, res, ret = true) {
		const { session, time } = req.body

		const instance = InstanceController.get(req, res, session)
		const { instagram, mouse } = instance

		if (instance) {
			InstanceController.setIdle(req, session, false)
			const currentUrl = instagram.url()

			if (currentUrl !== 'https://www.instagram.com/') {
				await mouse.click(Constants.navigates.home)
				await sleep(rand(1500, 2000))
			}

			const until = Math.floor(Date.now() / 1000 + parseInt(time))
			var now = Math.floor(Date.now() / 1000)

			await mouse.clickIfContext(Constants.buttons.dontAddToHomeScreen)

			while (now < until) {
				await mouse.clickIfContext(
					Constants.buttons.turnOffNotifications
				)
				await sleep(rand(1000, 3000))

				const scrollSize = rand(100, 300)

				await instagram.evaluate((scrollSize) => {
					window.scrollBy(0, scrollSize)
				}, scrollSize)
				now = Math.floor(Date.now() / 1000)
			}

			await sleep(rand(3000, 5000))

			InstanceController.setIdle(req, session, true)

			if (ret) {
				return res.json({ status: 'ok' })
			}
		}
	}

	async simulateRandomBehaviour(req, res) {
		const behaviour = 1 //rand(1, 2)

		switch (behaviour) {
			case 1:
				return this.feedExplore(req, res)
			default:
				return this.feedExplore(req, res)
		}
	}

	async simulateRandomBehaviourBackground(req, res) {
		const behaviour = 1 //rand(1, 2)

		res.json({ status: 'ok' })

		switch (behaviour) {
			case 1:
				await this.feedExplore(req, res, false)
				break
			default:
				await this.feedExplore(req, res, false)
				break
		}
	}
}

export default new BehaviourController()
