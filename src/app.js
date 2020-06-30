import 'dotenv/config'

import fs from 'fs'
import express from 'express'
import https from 'https'
import cors from 'cors'

import routes from './routes'

import './database'

class App {
	constructor() {
		if (process.env.NODE_ENV === 'development') {
			this.server = express()
		} else {
			this.app = express()
		}

		this.middlewares()
		this.routes()
	}

	middlewares() {}

	routes() {
		if (process.env.NODE_ENV === 'development') {
			this.server.use(cors())
			this.server.use(express.json({ limit: '10mb' }))
			this.server.use(routes)
		} else {
			this.app.use(cors())
			this.app.use(express.json({ limit: '10mb' }))
			this.app.use(routes)
			this.server = https.createServer(
				{
					key: fs.readFileSync(process.env.SERVER_KEY_FILE),
					cert: fs.readFileSync(process.env.SERVER_CERT_FILE),
					ca: fs.readFileSync(process.env.SERVER_CA_FILE),
					requestCert: false,
					rejectUnauthorized: false,
				},
				this.app
			)
		}
	}
}

export default new App()
