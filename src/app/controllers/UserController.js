import InstanceController from './InstanceController'

import Navigate from '../helpers/Navigate'

import sleep from '../helpers/Sleep'
import rand from '../helpers/Rand'

import Constants from '../../config/Constants'

class UserController {
	async feed(req, res) {
		const { session } = req.body
		const { user } = req.params

		const instance = InstanceController.get(req, res, session)
		const { instagram, log } = instance

		if (instance) {
			InstanceController.setIdle(req, session, false)
			instagram.on('response', async (response) => {
				const url = response.url()

				if (url.includes(`${user}/?__a=1`)) {
					log.text('Feed request intercepted!')
					try {
						log.text('Extracting results...')
						let feed = await response.json()
						log.text('Results extracted successfuly!')
						instagram.removeAllListeners('response')
						InstanceController.setIdle(req, session, true)
						log.text('Sending results...')
						res.json(feed)
						log.text('Sent!')
					} catch (e) {}
				}
			})

			log.text(`Navigating to @${user} to capture feed...`)
			await Navigate.navigateToUser(instance, user)
		}
	}

	async followers(req, res) {
		const { session, pages } = req.body
		const { user } = req.params

		if (pages > 10) {
			return res.json({
				status: 'fail',
				message: 'You cannot get more than 10 pages!',
			})
		}

		const instance = InstanceController.get(req, res, session)
		const { instagram, mouse } = instance

		if (instance) {
			InstanceController.setIdle(req, session, false)
			instagram.on('response', async (response) => {
				const url = response.url()

				if (url.includes(`c76146de99bb02f6415203be841dd25a`)) {
					countPages++

					let followers = await response.json()

					if (countPages < pages) {
						if (!resultFollowers) {
							resultFollowers =
								followers.data.user.edge_followed_by.edges
						} else {
							let edges =
								followers.data.user.edge_followed_by.edges
							edges.map((edge) => {
								resultFollowers.push(edge)
							})
						}
					} else {
						instagram.removeAllListeners('response')
						InstanceController.setIdle(req, session, true)
						res.json(resultFollowers)
					}
				}
			})

			var fetched = false

			while (!fetched) {
				try {
					fetched = true

					await Navigate.navigateToUser(instance, user)

					await sleep(rand(500, 1000))

					const isPrivate = await instagram.$(
						Constants.user.isPrivate
					)
					if (isPrivate) {
						return res.json({
							status: 'fail',
							messaage:
								'You cannot get followers from private accounts!',
						})
					}

					var resultFollowers = false
					var countPages = 0

					await mouse.click(Constants.feed.followers)
				} catch (e) {
					log.text(e)
					fetched = false
				}
			}
		}
	}

	async follow(req, res) {
		const { session } = req.body
		const { user } = req.params

		const instance = InstanceController.get(req, res, session)
		const { instagram, mouse, log } = instance

		log.text(`Follow function called!`)

		if (instance) {
			InstanceController.setIdle(req, session, false)
			const currentUrl = instagram.url()

			if (!currentUrl.includes(user)) {
				log.text(`Navigating to user`)
				await Navigate.navigateToUser(instance, user)
				await sleep(rand(1500, 2000))
			}

			instagram.on('response', async (response) => {
				const url = response.url()

				if (url.includes(`/follow/`)) {
					let follow = await response.json()
					instagram.removeAllListeners('response')
					if (follow.status === 'fail') {
						InstanceController.logout(
							req,
							res,
							session,
							'fail',
							'Your are going too fast! Please let your account rest for 12 hours before you try again!',
							'slowdown_required'
						)
					} else {
						res.json(follow)
						InstanceController.setIdle(req, session, true)
					}
				}
			})

			var followed = false

			while (!followed) {
				log.text(`Following ${user}`)
				try {
					followed = true

					const isFollowing = await instagram.$(
						Constants.feed.isFollowing
					)

					if (isFollowing) {
						InstanceController.setIdle(req, session, true)
						return res.json({
							status: 'ok',
							result: 'already following',
						})
					}

					const isPrivate = await instagram.$(
						Constants.feed.followPrivate
					)

					await instagram.evaluate(() => {
						document.documentElement.scrollTop = 0
					})

					if (isPrivate) {
						log.text(`Clicking follow ${user}`)
						await mouse.click(Constants.feed.followPrivate)
					} else {
						log.text(`Clicking follow ${user}`)
						await mouse.click(Constants.feed.follow)
					}
				} catch (e) {
					followed = false
				}
			}
		}
	}

	async unfollow(req, res) {
		const { session } = req.body
		const { user } = req.params

		const instance = InstanceController.get(req, res, session)
		const { instagram, mouse } = instance

		if (instance) {
			InstanceController.setIdle(req, session, false)
			const currentUrl = instagram.url()

			if (!currentUrl.includes(user)) {
				await Navigate.navigateToUser(instance, user)
				await sleep(rand(1500, 2000))
			}

			instagram.on('response', async (response) => {
				const url = response.url()

				if (url.includes(`/unfollow/`)) {
					let unfollow = await response.json()
					instagram.removeAllListeners('response')
					if (unfollow.status === 'fail') {
						InstanceController.logout(
							req,
							res,
							session,
							'fail',
							'Your are going too fast! Please let your account rest for 12 hours before you try again!',
							'slowdown_required'
						)
					} else {
						InstanceController.setIdle(req, session, true)
						res.json(unfollow)
					}
				}
			})

			var unfollowed = false

			while (!unfollowed) {
				try {
					unfollowed = true

					const isFollowing = await instagram.$(
						Constants.feed.isFollowing
					)

					if (!isFollowing) {
						InstanceController.setIdle(req, session, true)
						return res.json({
							status: 'ok',
							result: 'already unfollowing',
						})
					}

					await mouse.click(Constants.feed.unfollow)

					var confirmUnfollow = instagram.$(
						Constants.feed.confirmUnfollow
					)

					while (confirmUnfollow === null) {
						confirmUnfollow = instagram.$(
							Constants.feed.confirmUnfollow
						)
						await sleep(1000)
					}

					await mouse.click(Constants.feed.confirmUnfollow)
				} catch (e) {
					unfollowed = false
				}
			}
		}
	}
}

export default new UserController()
