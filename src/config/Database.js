require('dotenv/config')

module.exports = {
	dialect: 'mysql',
	host: process.env.MYSQL_HOST,
	port: process.env.MYSQL_PORT,
	username: process.env.MYSQL_USERNAME,
	password: process.env.MYSQL_PASSWORD,
	database: process.env.MYSQL_DATABASE,
	charset: 'utf8mb4',
	define: {
		timestamps: true,
		underscored: true,
		underscoredAll: true,
	},
	timezone: '-03:00',
	logging: false,
}
