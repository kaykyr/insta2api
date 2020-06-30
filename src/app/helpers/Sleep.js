export default async function (ms) {
	return await new Promise((resolve) => setTimeout(resolve, ms))
}
