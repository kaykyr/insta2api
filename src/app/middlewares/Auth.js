import jwt from 'jsonwebtoken'
import { promisify } from 'util'

import AuthConfig from '../../config/Auth'

export default async (req, res, next) => {
	const authHeader = req.headers.authorization

	if (!authHeader) {
		return res.status(401).json({ status: 'Non-Authorized!' })
	}

	const [, token] = authHeader.split(' ')

	try {
		const decoded = await promisify(jwt.verify)(token, AuthConfig.secret)

		req.token = decoded.token
		req.requests = decoded.requests
		req.instances = decoded.instances

		return next()
	} catch (err) {
		return res
			.status(401)
			.json({ status: "The token you provided isn't valid" })
	}
}
