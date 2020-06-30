import * as cluster from 'cluster'
import { env } from 'process'

import App from './app'

import State from './config/State'

if (cluster.isMaster) {
	var app = require('express')()

	app.get('/create/:port', function (req, res) {
		const { port } = req.params

		State.ports[port] = true

		env.port = port
		cluster.fork({ env: env.port })
		res.json({ status: 'ok', port })
	})

	app.all('/', function (req, res) {
		res.json({ status: 'ok', ports: State.ports })
	})

	app.listen(process.env.SERVER_PORT)
} else {
	const port = env.port
	App.server.listen(port)
}
