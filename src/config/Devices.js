import rand from '../app/helpers/Rand'

export default () => {
	const devices = [
		'iPhone 5',
		'iPhone 6',
		'iPhone 6 Plus',
		'iPhone 7',
		'iPhone 7 Plus',
		'iPhone 8',
		'iPhone 8 Plus',
		'iPhone SE',
		'iPhone X',
		'iPhone XR',
	]

	return devices[rand(0, devices.length - 1)]
}
