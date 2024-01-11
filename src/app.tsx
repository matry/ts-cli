import React from 'react'
import {Text} from 'ink'
import { clearDirectory, listFiles, readUTF8File, writeToJSON } from './utils/filesystem.js'
import { mergeBundle, parseMatryFile } from './utils/parser.js'

type Props = {
	dir: string | undefined
}

export default function App({dir = '.'}: Props) {
	const fileMap = listFiles(dir, {})
	const bundles = new Array<MatryBundle>()
	Object.entries(fileMap).forEach(([_, fileInfo]) => {
		const content = readUTF8File(fileInfo, 'matry')

		if (content) {
			try {
				const parsedContent = parseMatryFile(content)
				bundles.push(parsedContent)
			} catch (error: any) {
				throw new Error(`Compilation error in ${fileInfo.path}
				${error.message}
				`)
			}
		}
	})

	const mergedBundle = bundles.reduce((acc: MatryBundle, bundle: MatryBundle) => {
		return mergeBundle(acc, bundle)
	}, {
		matry_version: '0.0.0',
		version: '1.0.0', // todo - how to make this dynamic
		token_declarations: {},
		token_assignments: {},
	})

	clearDirectory('.build')
	writeToJSON('.build', 'bundle.json', mergedBundle)

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
