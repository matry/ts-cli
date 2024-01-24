import React from 'react'
import {Text} from 'ink'
import { clearDirectory, getMatryfile, listFiles, readUTF8File, writeToJSON } from './utils/filesystem.js'
import { Transformer } from './parser/transformer.js'

type Props = {
	dir: string | undefined
}

export default function App({dir = '.'}: Props) {
	const matryfile = getMatryfile(dir)

	console.log('mstryfiel')
	console.log(matryfile)

	if (!matryfile) {
		console.error('No Matryfile found')
		return null
	}

	clearDirectory('.tmp')

	const fileMap = listFiles(dir, {})

	let concatFiles = ''

	Object.entries(fileMap).forEach(([_, fileInfo]) => {
		const content = readUTF8File(fileInfo, 'matry')

		if (content && typeof content === 'string') {
			concatFiles += '\n'
			concatFiles += content
		}
	})

	try {
		const transformer = new Transformer(concatFiles)
		const parsedContent = transformer.transform()

		writeToJSON('.tmp', 'tmp.json', parsedContent)
	} catch (error: any) {
		throw new Error(`Compilation error:
		${error.message}
		`)
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
