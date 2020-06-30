import fs from 'fs'
import { resolve } from 'path'

export default async function (cookies, session, stringify = true) {
	const content = stringify ? JSON.stringify(cookies) : cookies
	return fs.writeFile(
		resolve(__dirname, '..', '..', 'sessions', `${session}.json`),
		content,
		(err) => {
			if (err) {
				console.error(err)
				return
			}
		}
	)
}
