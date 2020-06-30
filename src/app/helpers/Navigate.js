import Constants from '../../config/Constants'

import sleep from './Sleep'
import rand from './Rand'

export default {
	navigateToUser: async (instance, user) => {
		const { instagram, keyboard, mouse, log } = instance
		log.text(`navigateToUser() called!`)
		var navigated = false

		while (!navigated) {
			try {
				navigated = true

				var currentUrl = instagram.url()

				var seconds = 0

				while (modal === null && seconds < 10) {
					log.text(`Clicking turn off notifications...${seconds}`)
					seconds++
					await sleep(1000)
					modal = await instagram.$(
						Constants.buttons.turnOffNotifications
					)
				}

				await mouse.clickIfContext(
					Constants.buttons.turnOffNotifications
				)

				log.text('Navigating to search...')
				await mouse.click(Constants.navigates.search)

				log.text('Checking modal...')
				var modal = await instagram.$(
					Constants.buttons.turnOffNotifications
				)

				seconds = 0

				while (modal === null && seconds < 10) {
					log.text(`Clicking turn off notifications...${seconds}`)
					seconds++
					await sleep(1000)
					modal = await instagram.$(
						Constants.buttons.turnOffNotifications
					)
				}

				await mouse.clickIfContext(
					Constants.buttons.turnOffNotifications
				)

				while (!currentUrl.includes('explore')) {
					await sleep(rand(1000, 2000))
					await mouse.click(Constants.navigates.search)
					currentUrl = instagram.url()
				}

				var inputSearch = instagram.$(Constants.inputs.search)

				while (inputSearch === null) {
					inputSearch = instagram.$(Constants.inputs.search)
					await sleep(1000)
				}

				await mouse.click(Constants.inputs.search)

				currentUrl = instagram.url()

				while (!currentUrl.includes('search')) {
					await sleep(rand(1000, 2000))
					await mouse.click(Constants.inputs.search)
					currentUrl = instagram.url()
				}

				await sleep(rand(1000, 2000))
				await keyboard.type(user)

				var searchDone = instagram.$(Constants.search.result(user))

				while (searchDone === null) {
					searchDone = instagram.$(Constants.search.result(user))
					await sleep(1000)
				}

				await sleep(1500, 2000)
				await mouse.click(Constants.search.result(user))

				currentUrl = instagram.url()

				while (!currentUrl.includes(user)) {
					await sleep(rand(1000, 2000))
					await mouse.click(Constants.search.result(user))
					currentUrl = instagram.url()
				}
			} catch (e) {
				log.text(e)
				log.text(`Fatal error trying to navigate: ${e.name}`)
				console.log(e)
				navigated = false
			}
		}
		log.text('Navigate to user finished!')
	},

	navigateToSearch: async (instance) => {
		const { instagram, mouse } = instance
		var navigated = false

		while (!navigated) {
			try {
				navigated = true
				var currentUrl = instagram.url()

				await mouse.clickIfContext(
					Constants.buttons.turnOffNotifications
				)
				await mouse.click(Constants.navigates.search)

				while (!currentUrl.includes('explore')) {
					await mouse.click(Constants.navigates.search)
					currentUrl = instagram.url()
				}

				await mouse.click(Constants.inputs.search)

				currentUrl = instagram.url()

				while (!currentUrl.includes('search')) {
					await mouse.click(Constants.inputs.search)
					currentUrl = instagram.url()
				}
			} catch (e) {
				navigated = false
			}
		}
	},

	navigateToDirectInbox: async (instance) => {
		const { instagram, mouse } = instance
		var currentUrl = instagram.url()

		await mouse.click(Constants.navigates.home)

		while (currentUrl !== 'https://www.instagram.com/') {
			await mouse.click(Constants.navigates.home)
			await sleep(rand(1500, 3000))
			currentUrl = instagram.url()
		}

		await mouse.click(Constants.navigates.directInbox)
		currentUrl = instagram.url()

		while (!currentUrl.includes('direct/inbox')) {
			await mouse.click(Constants.navigates.directInbox)
			await sleep(rand(1500, 3000))
			currentUrl = instagram.url()
		}
	},
}
