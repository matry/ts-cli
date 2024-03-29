import React from 'react'
import {Text} from 'ink'
import { writeCSSFile, writeTempFile } from './utils/controller.js'
import { clearDirectory, getMatryProject } from './utils/filesystem.js'
import { Renderer } from './parser/renderer.js'
import './test/color-functions.js'
import { Builder } from './parser/builder.js'
import { Bundler } from './parser/bundler.js'

type Props = {
	input: string[]
	dir: string | undefined
}

export default function App({ dir = '.' , input = []}: Props) {
	let output: any = null

	const cmd = input[0] || ''

	switch (cmd) {
		case 'build':
			clearDirectory('.tmp')
			clearDirectory('bundle')

			const files = getMatryProject(dir) // transform directory into matry files
			const builder = new Builder(files)
			builder.build() // transform files into build tree

			writeTempFile('build', builder.output)

			const renderer = new Renderer(builder.output) // transform build into render tree
			renderer.render({
				'theme': 'rosemary',
			})
			writeTempFile('render', renderer.output)

			const bundler = new Bundler(renderer.output)
			bundler.bundle()
			writeCSSFile('vars', bundler.output)

			break
		default:
			break
	}

	return (
		<>
			<Text color="green">Parsing complete</Text>
			{!!output && (
				<Text color="green">

				</Text>
			)}

			{/* {Object.entries(fileMap).map(([path, fileInfo]) => {
				return (
					<Box key={path}>
						<Text color="grey">
							Path: {path}
						</Text>
						<br />
						<Text color="blue">
							Type: {fileInfo.type || 'None'}
						</Text>
					</Box>
				)
			})} */}
		</>
	)
}
