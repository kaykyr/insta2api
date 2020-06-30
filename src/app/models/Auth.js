import Sequelize, { Model } from 'sequelize'

class Auth extends Model {
	static init(sequelize) {
		super.init(
			{
				id: {
					type: Sequelize.INTEGER,
					primaryKey: true,
				},
				token: Sequelize.STRING,
				auth: Sequelize.STRING,
				instances: Sequelize.INTEGER,
				requests: Sequelize.INTEGER,
			},
			{
				sequelize,
			}
		)

		return this
	}
}

export default Auth
