import InstanceController from '../controllers/InstanceController'

export default async (req, res, next) => {
	const { session } = req.body
	req.setTimeout(180000)

	const instance = InstanceController.get(req, res, session)

	if (instance) {
		const { idle } = instance

		if (idle) {
			return next()
		} else {
			return res.json({
				status: 'fail',
				code: 'busy',
				message:
					'Your instance is busy right now! You can call /destroy to stop all jobs.',
			})
		}
	}

	return
}
