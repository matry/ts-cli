#!/usr/bin/env node
import React from 'react'
import {render} from 'ink'
import meow from 'meow'
import App from './app.js'

const cli = meow(
	`
	Usage
	  $ ts-cli <cmd>

	Commands
		build
		render

	Options
		--dir  The target directory

	Examples
	  $ ts-cli --dir=./path/to/my/matry/project
	  The current directory is ./path/to/my/matry/project
`,
	{
		importMeta: import.meta,
		flags: {
			dir: {
				type: 'string',
			},
		},
	},
)

render(<App input={cli.input} dir={cli.flags.dir} />)
