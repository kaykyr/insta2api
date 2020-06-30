import InstanceController from './InstanceController'

import Navigate from '../helpers/Navigate'

class SearchController {
	async index(req, res) {
		const { session, keyword } = req.body

		const instance = InstanceController.get(req, res, session)
		const { instagram, keyboard } = instance

		if (instance) {
			InstanceController.setIdle(req, session, false)
			await Navigate.navigateToSearch(instance)

			instagram.on('response', async (response) => {
				const url = response.url()

				if (url.includes(`&query=${keyword}`)) {
					let search = await response.json()
					instagram.removeAllListeners('response')
					InstanceController.setIdle(req, session, true)
					res.json(search)
				}
			})

			await keyboard.type(keyword)
		}
	}
}

export default new SearchController()
