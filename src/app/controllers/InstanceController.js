import fs from 'fs';
import { resolve } from 'path';

import puppeteer from 'puppeteer';

import State from '../../config/State';
import Constants from '../../config/Constants';
import Devices from '../../config/Devices';

import Keyboard from '../helpers/Keyboard';
import Mouse from '../helpers/Mouse';

import Log from '../helpers/Log';
import store from '../helpers/Store';
import sleep from '../helpers/Sleep';

class InstanceController {
	async index(req, res) {
		console.log(State.instances);
		return res.json({ status: 'ok', instances: State.instances });
	}

	async create(req, res) {
		const { instances, token } = req;
		const { username, password, device, proxy, remoteDebug } = req.body;

		if (State.instances[token] !== undefined) {
			if (State.instances[token][username] !== undefined) {
				return res.json({
					status: 'ok',
					message: 'This instance has already created!',
				});
			}

			if (instances !== 0) {
				if (Object.keys(State.instances[token]).length >= instances) {
					return res.json({
						status: 'fail',
						message: 'You reached the limit of instances in your account!',
					});
				}
			}

			State.instances[token][username] = {};
		} else {
			State.instances[token] = { [username]: {} };
		}

		req.setTimeout(500000);

		const emulateDevice = puppeteer.devices[device ? device : Devices()];

		var formatedProxy = proxy;
		var proxyUsername = false;
		var proxyPassword = false;

		if (proxy.includes('@')) {
			formatedProxy = proxy.split('@')[1];
			proxyUsername = proxy.split('@')[0].split('://')[1].split(':')[0];
			proxyPassword = proxy.split('@')[0].split('://')[1].split(':')[1];
		}

		const browser = await puppeteer.launch({
			headless: process.env.HEADLESS === '0' ? false : true,
			deviceScaleFactor: 1,
			isMobile: true,
			hasTouch: true,
			devtools: false,
			ignoreHTTPErrors: true,
			args: [`${proxy && `--proxy-server=${formatedProxy}`}`, '--no-sandbox'],
		});

		var previousSession = false;

		if (fs.existsSync(resolve(__dirname, '..', '..', 'sessions', `${username}.json`))) {
			previousSession = JSON.parse(fs.readFileSync(resolve(__dirname, '..', '..', 'sessions', `${username}.json`)));
		}

		const instagram = (await browser.pages())[0];

		if (proxyUsername) {
			await instagram.authenticate({
				username: proxyUsername,
				password: proxyPassword,
			});
		}

		const mouse = new Mouse(instagram);
		const keyboard = new Keyboard(instagram);
		const log = new Log(username);

		if (previousSession) {
			let setCookies = previousSession.map(async (cookie) => {
				await instagram.setCookie(cookie);
			});

			await Promise.all(setCookies);

			await instagram.emulate(emulateDevice);
			await instagram.goto('https://www.instagram.com', {
				waitUntil: ['domcontentloaded', 'networkidle2'],
				timeout: 0,
			});

			res.json({
				status: 'ok',
				device: emulateDevice,
				cookies: previousSession,
			});
		} else {
			await instagram.emulate(emulateDevice);

			await instagram.goto('https://www.instagram.com', {
				waitUntil: ['domcontentloaded', 'networkidle2'],
				timeout: 0,
			});

			await mouse.click(Constants.buttons.login);

			await mouse.click(Constants.inputs.username);
			await keyboard.type(username);

			await mouse.click(Constants.inputs.password);
			await keyboard.type(password);

			var login = false;

			instagram.on('response', async (response) => {
				const url = response.url();

				if (url.includes(`/login/ajax/`)) {
					login = await response.json();
					instagram.removeAllListeners('response');
				}
			});

			await mouse.click(Constants.buttons.confirmLogin);

			let currentEndpoint = instagram.url();
			let stop = false;

			while (!currentEndpoint.includes('accounts/onetap') && !stop) {
				if (currentEndpoint.includes('challenge')) {
					try {
						stop = true;

						let challenge = await instagram.evaluate(() => window.__initialData.data.entry_data.Challenge[0]);

						instagram.removeAllListeners('response');

						State.instances[token][username] = {
							instagram,
							browser,
							mouse,
							keyboard,
							idle: true,
						};

						return res.json({
							status: 'challenge_required',
							challenge,
						});
					} catch (e) {
						stop = false;
					}
				} else if (currentEndpoint.includes('accounts/onetap')) {
					stop = true;
				}
				await sleep(1000);
				currentEndpoint = instagram.url();
			}

			await mouse.click(Constants.buttons.dontSaveInfo);

			while (!login) {}

			res.json({ ...login, device: emulateDevice });
		}

		const cookies = await instagram.cookies();

		State.instances[token][username] = {
			instagram,
			browser,
			mouse,
			keyboard,
			log,
			idle: true,
		};

		await store(cookies, username);
	}

	async importCookies(req, res) {
		const { cookies, session } = req.body;

		console.log(typeof cookies);
		console.log(cookies);

		await store(cookies, session);
		return res.json({ status: 'ok' });
	}

	async sendCode(req, res) {
		const { session, choice } = req.body;

		const instance = this.get(req, res, session);
		const { instagram, mouse } = instance;

		instagram.on('response', async (response) => {
			const url = response.url();

			if (url.includes(`challenge`)) {
				let challenge = await response.json();
				instagram.removeAllListeners('response');
				res.json({ status: 'ok', challenge });
			}
		});

		if (instagram.$(Constants.challenge.choice0) !== null || instagram.$(Constants.challenge.choice1) !== null) {
			switch (choice) {
				case 0:
					await mouse.click(Constants.challenge.choice0);
					break;
				case 1:
					await mouse.click(Constants.challenge.choice1);
					break;
				default:
					await mouse.click(Constants.challenge.choice0);
			}
		}

		await mouse.click(Constants.challenge.sendCode);
	}

	async parseChallenge(req, res) {
		const { session, code } = req.body;

		const instance = this.get(req, res, session);
		const { instagram, mouse, keyboard } = instance;

		instagram.on('response', async (response) => {
			const url = response.url();

			if (url.includes(`challenge`)) {
				let challenge = await response.json();
				instagram.removeAllListeners('response');
				res.json({ status: 'ok', challenge });

				if (challenge.status === 'ok') {
					const cookies = await instagram.cookies();
					await store(cookies, session);
				}
			}
		});

		await mouse.click(Constants.challenge.codeField);
		await keyboard.type(code.toString());
		await mouse.click(Constants.challenge.submit);
	}

	get(req, res, session) {
		const { token } = req;

		if (typeof State.instances[token] == 'undefined' || typeof State.instances[token][session] == 'undefined') {
			res.json({
				status: 'fail',
				reason: "Your instance wasn't initialized!",
			});

			return false;
		}

		const instance = State.instances[token][session];

		return instance;
	}

	setIdle(req, session, idle) {
		const { token } = req;
		const instance = State.instances[token][session];

		if (typeof instance === undefined) {
			res.json({
				status: 'fail',
				reason: "Your instance wasn't initialized!",
			});

			return false;
		}

		State.instances[token][session].idle = idle;
	}

	getInstanceStatus(req, res) {
		const { token } = req;
		const { session } = req.body;
		const instance = State.instances[token][session];

		if (typeof instance === undefined) {
			res.json({
				status: 'fail',
				reason: "Your instance wasn't initialized!",
			});

			return false;
		}

		return res.json({
			status: 'ok',
			idle: State.instances[token][session].idle,
		});
	}

	async captureScreen(req, res) {
		const { session } = req.body;

		const instance = this.get(req, res, session);

		if (instance.instagram) {
			const screenCapture = await instance.instagram.screenshot({
				type: 'jpeg',
				encoding: 'base64',
				quality: 80,
			});

			res.json({ status: 'ok', screenCapture });
		} else {
			res.json({
				status: 'fail',
				message: "The requested session doesn't exists",
			});
		}
	}

	async logout(req, res, session, status = 'ok', message = false, code = 'logout') {
		const { token } = req;

		if (typeof State.instances[token] == 'undefined' || typeof State.instances[token][session] == 'undefined') {
			res.json({
				status: 'fail',
				reason: "Your instance wasn't initialized!",
			});

			return false;
		}

		const instance = State.instances[token][session];

		await instance.instagram.close();
		await instance.browser.close();
		delete State.instances[token][session];

		fs.unlinkSync(resolve(__dirname, '..', '..', 'sessions', `${session}.json`));

		return res.json({ status, message, code });
	}

	async destroy(req, res) {
		console.log('Destroy called!');
		const { token } = req;
		const { session } = req.body;

		if (typeof State.instances[token] == 'undefined' || typeof State.instances[token][session] == 'undefined') {
			console.log('Theres no instance to destroy!');
			res.json({
				status: 'fail',
				reason: "Your instance wasn't initialized!",
			});

			return false;
		}

		console.log('There are instance to destroy!');

		const instance = State.instances[token][session];

		if (instance.instagram) {
			console.log('Destroying Instagram!');
			await instance.instagram.close();
			console.log('Destroying Browser!');
			await instance.browser.close();
			console.log('Destroying Deleting Session!');
		}

		delete State.instances[token][session];

		console.log('Returning response!');
		return res.json({ status: 'ok' });
	}
}

export default new InstanceController();
