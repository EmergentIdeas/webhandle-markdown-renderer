
let appName = 'webhandle-markdown-renderer'

module.exports = {
	apps: [
		{
			name: appName + '-dev-web',
			script: 'node --inspect --watch $(npm root -g)/@webhandle/emergent-ideas-2025/environment-start.mjs ./server-js/start.mjs',
			"env": {
				webhandleConfigFile: 'conf/dev.json'
			}
		}
	]
};

