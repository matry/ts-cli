import React from 'react'
import {Text} from 'ink'
import { build } from './utils/build.js'

type Props = {
	input: string[]
	dir: string | undefined
}

export default function App({ dir = '.' , input = []}: Props) {
	const cmd = input[0] || ''

	console.log(`received cmd ${cmd}`)

	let output = null

	switch (cmd) {
		case 'build':
			build(dir)
			break
		default:
			break
	}

	if (output === null) {

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
