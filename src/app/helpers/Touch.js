class Touch {
	setPage(page) {
		this.page = page
	}

	async touch(x, y) {
		this.page.touchscreen(x, y)
	}
}

export default new Touch()
