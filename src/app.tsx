import React from 'react'
import {Text} from 'ink'
import { parse, writeToDisk } from './utils/controller.js'
import { clearDirectory } from './utils/filesystem.js'
import { Renderer } from './parser/renderer.js'

type Props = {
	input: string[]
	dir: string | undefined
}

export default function App({ dir = '.' , input = []}: Props) {
	const cmd = input[0] || ''
	console.log(`received cmd ${cmd}`)

	switch (cmd) {
		case 'build':
			clearDirectory('.tmp')
			const content = parse(dir)

			const renderer = new Renderer(content)
			renderer.render()

			console.log('output')
			console.log(renderer.output)

			writeToDisk(content)
			break
		default:
			break
	}

	return (
		<>
			<Text color="green">Parsing complete</Text>
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
