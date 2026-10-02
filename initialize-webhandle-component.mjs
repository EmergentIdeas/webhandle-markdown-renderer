import createInitializeWebhandleComponent from "@webhandle/initialize-webhandle-component/create-initialize-webhandle-component.mjs"
import ComponentManager from "@webhandle/initialize-webhandle-component/component-manager.mjs"
import path from "node:path"
import fs from "node:fs/promises"

import MarkdownIt from 'markdown-it'
import hljs from 'highlight.js'
const md = new MarkdownIt({
	highlight: function (str, lang) {
		if (lang && hljs.getLanguage(lang)) {
			try {
				return `<pre><code class="hljs">${hljs.highlight(str, { language: lang, ignoreIllegals: true }).value}</code></pre>`;
			} catch (__) { }
		}
		// Return default stripped string if language isn't supported
		return `<pre><code class="hljs">${md.utils.escapeHtml(str)}</code></pre>`;
	}
})


const initializeWebhandleComponent = createInitializeWebhandleComponent()

initializeWebhandleComponent.componentName = '@webhandle/markdown-renderer'
initializeWebhandleComponent.componentDir = import.meta.dirname
initializeWebhandleComponent.defaultConfig = {
	"publicFilesPrefix": '/' + initializeWebhandleComponent.componentName + "/files"
	, "alwaysProvideResources": false
}
initializeWebhandleComponent.staticFilePath = 'public'
initializeWebhandleComponent.templatePath = 'views'


initializeWebhandleComponent.setup = async function(webhandle, config) {
	let manager = new ComponentManager()
	manager.config = config
	
	// set the format which termines what a template/active section looks like
	let templateRegExpression = /\!\[\[(.*?)\]\]/

	// create a render engine in Express
	manager.renderTemplate = async function(filePath, options, callback) {
		// do a security check to make sure we're at least loading a file inside the project
		filePath = path.resolve(filePath)
		if (!filePath.startsWith(webhandle.projectRoot)) {
			throw new Error(`Request for ${filePath} falls outside project folder.`)
		}
		let markdown
		try {
			markdown = await fs.readFile(filePath)
			markdown = markdown.toString()
		}
		catch (e) {
			// this really shouldn't happen since Express has already found the template which
			// is what causes this code to be called.
			if (callback) {
				callback(e)
			}
			return
		}
		
		manager.renderTemplateContent(markdown, options, callback)
	}
	
	manager.renderTemplateContent = async function(markdown, options, callback) {
		// We're used the highlight code transform, so we'll need to include the stylesheet to format it.
		// Potentially this could be change to reference a local version of this file
		if(options && options.externalResourceManager) {
			manager.addExternalResources(options.externalResourceManager)
		}
		
		let parts = []

		// tokenize the markdown into segments which are normal markdown and segments we should interpret
		// as templates. The designator for a template is `![[]]`. This is not standard markdown but is used
		// by obsidian to indicate that another document should be embedded.
		let unconsumed = markdown
		while (true) {
			let match = templateRegExpression.exec(unconsumed)
			if (match) {
				let templateExpression = match[1]
				let first = unconsumed.substring(0, match.index)
				let last = unconsumed.substring(match.index + match[0].length)
				unconsumed = last
				parts.push({
					type: 'markdown'
					, content: first
				})
				if (templateExpression && templateExpression.startsWith('::')) {
					let templateName = templateExpression.substring(2)
					parts.push({
						type: 'template'
						, content: templateName
					})
				}
				else {
					parts.push({
						type: 'markdown'
						, content: match[0]
					})
				}
			}
			else {
				parts.push({
					type: 'markdown'
					, content: unconsumed
				})
				break
			}
		}

		// Convert any parts which are not already html to html by either running the markdown
		// renderer or by asking webhandle to render the template.
		let result = ''
		for (let part of parts) {
			if (part.type === 'markdown') {
				part.content = md.render(part.content)
				part.type = 'html'
			}
			else if (part.type === 'template') {
				let replacement = await webhandle.render(part.content, options)
				part.content = replacement
				part.type = 'html'
			}
		}

		// Add all of the html tokens to the result.
		for (let part of parts) {
			if (part.type === 'html') {
				result += part.content
			}
		}

		callback(null, result)
	}
	webhandle.app.engine('md', manager.renderTemplate)
	
	manager.addExternalResources = (externalResourceManager, options) => {
		externalResourceManager.includeResource({
			mimeType: 'text/css'
			, url: 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.12.0/styles/default.min.css'
		})
	}

	webhandle.addTemplate(initializeWebhandleComponent.componentName + '/addExternalResources', (data) => {
		let externalResourceManager = initializeWebhandleComponent.getExternalResourceManager(data)
		manager.addExternalResources(externalResourceManager)
	})

	webhandle.addTemplate(initializeWebhandleComponent.componentName + '/renderExternalResources', (data) => {
		let externalResourceManager = initializeWebhandleComponent.getExternalResourceManager(data)
		manager.addExternalResources(externalResourceManager)
		return externalResourceManager.render()
	})

	return manager
}

export default initializeWebhandleComponent