import React from 'react'
import {Text} from 'ink'
import { clearDirectory, listFiles, readUTF8File, writeToJSON } from './utils/filesystem.js'
import { mergeBundle, parseMatryFile } from './utils/parser.js'

type Props = {
	dir: string | undefined
}

export default function App({dir = '.'}: Props) {
	clearDirectory('.build')

	const fileMap = listFiles(dir, {})
	const bundles = new Array()

	Object.entries(fileMap).forEach(([_, fileInfo]) => {
		const content = readUTF8File(fileInfo, 'matry')

		if (content) {
			try {
				const parsedContent = parseMatryFile(content)
				bundles.push(parsedContent)

				writeToJSON('.build', `${fileInfo.name}.json`, bundles)
			} catch (error: any) {
				throw new Error(`Compilation error in ${fileInfo.path}
				${error.message}
				`)
			}
		}
	})

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
