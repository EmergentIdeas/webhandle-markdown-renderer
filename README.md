# Markdown Renderer

Adds markdown file rendering to the webhandle environment.

## Install

```bash
npm install @webhandle/markdown-renderer
```

## Usage

To add markdown rendering to the webhandle environment.

```js
import setup from "@webhandle/markdown-renderer/initialize-webhandle-component.mjs"
await setup(webhandle)
```


## Template Locations

Markdown templates can be in any of the Express view locations. They must end with `.md`.
To add a new directory to Express:

```js
import path from "node:path"

// Set up a new views directory in Express for the documentation
let mdViewsDir = path.join(webhandle.projectRoot, 'docs')
let currentViews = webhandle.app.get('views')
if (typeof currentViews == 'string') {
	currentViews = [currentViews]
}
currentViews.push(mdViewsDir)
webhandle.app.set('views', currentViews)
```


## Rendering

Rendering with these templates is standard for both express and webhandle.

```js
res.render('my-document.md')
```

or

```js
let content = await webhandle.render('my-document.md')
```

or

```js
let markdownRenderManager = webhandle.componentManagers('@webhandle/markdown-renderer').renderTemplate('/path/to/file', data, callback)
```
where `callback` is a function with signature `function(err, content)`. Note, the first arg is expected to be an absolute path.

or, if you have markdown content which is not saved as a template
```js
let markdownRenderManager = webhandle.componentManagers('@webhandle/markdown-renderer').renderTemplateContent(markdownText, data, callback)
```
where `callback` is a function with signature `function(err, content)`. Note, the first arg is expected to be an absolute path.



## Including Another Template in a Markdown Template

This code extends default Markdown syntax like Obsidian to allow additional templates to be called/embedded. These
can be any type of template webhandle can find (markdown, tripartite, function, other).

```md
![[::my-sub-section.md]]
```
or

```md
![[::my-boilerplate-tripartite]]
```

## Example Code for Serving MD Files like Pages

```js
// Add what is essentially a page handler which renders things out of the docs directory.
webhandle.routers.primary.get(['/docs', '/docs/:page'], async (req, res, next) => {
	await webhandle.pageServer.setupDataForPages(req, res)
	let page = req.params.page || 'index.md'
	let content = await webhandle.render(page, res.locals)
	res.end(content)
})
```
