export default {
	buttons: {
		login: 'div > div:nth-child(2) > button',
		confirmLogin: 'button[type=submit]',
		dontSaveInfo: '#react-root > section > main > div > div > div > button',
		notNow:
			'body > div.RnEpo.xpORG._9Mt7n > div > div.YkJYY > div > div:nth-child(5) > button',
		turnOffNotifications: 'div[role="presentation"] button:nth-child(2)',
		dontAddToHomeScreen:
			'body > div.RnEpo.Yx5HN > div > div > div > div.mt3GC > button.aOOlW.HoLwm',
		turnOnNotifications:
			'body > div.RnEpo.Yx5HN > div > div > div.mt3GC > button.aOOlW.bIiDR',
		dontDownloadApp:
			'body > div.RnEpo.xpORG._9Mt7n > div > div.YkJYY > div > div:nth-child(5) > button',
		postComment:
			'#react-root > section > main > section > div > form > button',
		followIndex: (index) =>
			`#react-root > section > main > div > ul > div > li:nth-child(${index}) > div > div.Pkbci > button`,
	},
	inputs: {
		username: 'input[name="username"]',
		password: 'input[name="password"]',
		search: 'input[type="search"]',
		comment: 'form>textarea',
	},
	navigates: {
		home: 'nav > div > div > div > div > div > div',
		activity: 'nav > div > div > div > div > div > div:nth-child(4)',
		directInbox:
			'#react-root > section > nav.gW4DF > div > div > header > div > div.mXkkY.KDuQp',
		search:
			'#react-root > section > nav.NXc7H.f11OC > div > div > div.KGiwt > div > div > div:nth-child(2)',
	},
	search: {
		result: (user) =>
			`#react-root > section > main > div > div > ul > li > a[href="/${user}/"]`,
	},
	user: {
		isPrivate:
			'#react-root > section > main > div > div.Nd_Rl._2z6nI > article > div._4Kbb_ > div > h2',
	},
	feed: {
		followers:
			'#react-root > section > main > div > ul > li:nth-child(2) > a',
		follow: 'span>button:nth-child(1)',
		unfollow: 'span>button:nth-child(1)',
		confirmUnfollow: 'body > div > div > div > div > div > button',
		followPrivate:
			'#react-root > section > main > div > header > section > div.Y2E37',
		isFollowing: 'div:nth-child(2)>span>span>button',
	},
	challenge: {
		choice0:
			'#react-root > section > div > div > div.GA2q- > form > div > div:nth-child(1) > label',
		choice1:
			'#react-root > section > div > div > div.GA2q- > form > div > div:nth-child(2) > label',
		sendCode:
			'#react-root > section > div > div > div.GA2q- > form > span > button',
		codeField: '#security_code',
		submit:
			'#react-root > section > div > div > div.GA2q- > form > span > button',
	},
	media: {
		like:
			'#react-root > section > main > div > div > article > div.eo2As > section.ltpMr.Slqrh > span.fr66n > button',
		like2:
			'#react-root > section > main > div > div > article > div.eo2As > section.ltpMr.Slqrh > span.FY9nT.fr66n > button',
		comment: 'span:nth-child(2)>button',
		liked: 'svg[fill="#ed4956"]',
	},
}
