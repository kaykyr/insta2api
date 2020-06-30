import jwt from 'jsonwebtoken'
import md5 from 'md5'
import Auth from '../models/Auth'

import AuthConfig from '../../config/Auth'

class AuthController {
	async index(req, res) {
		const { token } = req.body

		if (!token)
			return res.json({
				status: false,
				message: 'You should provide a token!',
			})

		const auth = await Auth.findOne({
			where: {
				auth: md5(md5(token) + AuthConfig.secret + md5(token)),
			},
		})

		const response = auth
			? {
					status: true,
					authorization: jwt.sign(
						{
							token: auth.token,
							instances: auth.instances,
							requests: auth.requests,
						},
						AuthConfig.secret,
						{
							expiresIn: AuthConfig.expiresIn,
						}
					),
			  }
			: { status: false }

		return res.json(response)
	}
}

export default new AuthController()
