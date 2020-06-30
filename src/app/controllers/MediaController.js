import InstanceController from './InstanceController'

import Navigate from '../helpers/Navigate'

import sleep from '../helpers/Sleep'
import rand from '../helpers/Rand'

import Constants from '../../config/Constants'

class MediaController {
	async like(req, res) {
		const { session } = req.body
		const { user, mediaId } = req.params

		const instance = InstanceController.get(req, res, session)
		const { instagram, mouse, log } = instance

		log.text('Like function called!')

		if (instance) {
			InstanceController.setIdle(req, session, false)
			var currentUrl = instagram.url()

			if (!currentUrl.includes(user)) {
				log.text(`Navigating to user... ${user}`)
				await Navigate.navigateToUser(instance, user)
				await sleep(rand(1500, 2000))
			}

			instagram.on('response', async (response) => {
				const url = response.url()

				if (url.includes(`/like/`)) {
					let like = await response.json()
					console.log(like)
					instagram.removeAllListeners('response')
					instagram.goBack()
					if (like.status === 'fail') {
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
						res.json(like)
					}
				}
			})

			log.text(`Clicking ${mediaId}`)
			await mouse.click(`a[href="/p/${mediaId}/"`)
			await sleep(rand(1500, 2000))

			currentUrl = instagram.url()

			while (!currentUrl.includes(mediaId)) {
				log.text(`Waiting navigation to ${mediaId}`)
				await instagram.evaluate(() => {
					window.scrollBy(0, 100)
				})
				await instagram.evaluate((selector) => {
					const media = document.querySelector(selector)

					media.scrollTop = media.offsetHeight
				}, `a[href="/p/${mediaId}/"`)
				await mouse.click(`a[href="/p/${mediaId}/"`)
				await sleep(rand(1500, 2000))
				currentUrl = instagram.url()
			}

			var liked = false

			while (!liked) {
				log.text(`Liking ${mediaId}`)
				try {
					liked = true

					const isType2 = await instagram.$(Constants.media.like2)
					const currentLiked = await instagram.$(
						Constants.media.liked
					)

					if (currentLiked) {
						liked = true
						instagram.removeAllListeners('response')
						instagram.goBack()
						InstanceController.setIdle(req, session, true)
						return res.json({
							status: 'ok',
							message: 'Already liked!',
						})
					}

					const scrollSize = rand(100, 300)

					if (isType2) {
						log.text(`Clicking like button 2 ${mediaId}`)
						await instagram.evaluate((scrollSize) => {
							window.scrollBy(0, scrollSize)
						}, scrollSize)

						try {
							await mouse.click(Constants.media.like2)
						} catch (e) {
							log.text('Error during like 2')
							console.log(e)
							liked = false
						}
					} else {
						log.text(`Clicking like button 1 ${mediaId}`)

						await instagram.evaluate((scrollSize) => {
							window.scrollBy(0, scrollSize)
						}, scrollSize)

						try {
							await mouse.click(Constants.media.like)
						} catch (e) {
							log.text('Error during like 1')
							console.log(e)
							liked = false
						}
					}
				} catch (e) {
					console.log('[ERROR]')
					console.log(e)
					liked = false
				}
			}
		}
	}

	async comment(req, res) {
		const { session, comment } = req.body
		const { user, mediaId } = req.params

		const instance = InstanceController.get(req, res, session)
		const { instagram, mouse, keyboard, log } = instance

		if (instance) {
			InstanceController.setIdle(req, session, false)
			const currentUrl = instagram.url()

			if (!currentUrl.includes(user)) {
				await Navigate.navigateToUser(instance, user)
				await sleep(rand(1500, 2000))
			}

			instagram.on('response', async (response) => {
				const url = response.url()

				if (url.includes(`/add/`)) {
					let add = await response.json()
					instagram.removeAllListeners('response')
					if (add.status === 'fail') {
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
						res.json(add)
					}
				}
			})

			var commented = false

			while (!commented) {
				try {
					commented = true
					await mouse.clickIfContext(`a[href="/p/${mediaId}/"`)

					await sleep(rand(1500, 2000))

					await mouse.click(Constants.media.comment)

					await sleep(rand(1500, 2000))

					await mouse.click(Constants.inputs.comment)
					await keyboard.type(comment)
					await mouse.click(Constants.buttons.postComment)
				} catch (e) {
					commented = false
				}
			}
		}
	}
}

export default new MediaController()
