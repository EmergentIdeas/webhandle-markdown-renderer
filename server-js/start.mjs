import fs from "node:fs/promises"
import path from "node:path"
import mdInit from "../initialize-webhandle-component.mjs"

export default async function start(webhandle) {
	
	await mdInit(webhandle)

	let curDir = import.meta.dirname
	let files = await fs.readdir(path.join(curDir, 'setups'))
	files = files.filter(filename => filename.endsWith('.mjs'))
	
	for(let filename of files) {
		let mod = await import('./setups/' + filename)
		await mod.default(webhandle)
	}
	
	
	// Add what is essentially a page handler which renders things out of the docs directory.
	webhandle.routers.primary.get(['/docs', '/docs/:page'], async (req, res, next) => {
		await webhandle.pageServer.setupDataForPages(req, res)
		let page = req.params.page || 'index.md'
		let content = await webhandle.render(page, res.locals)
		res.end(content)

	})
}


