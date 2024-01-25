import { Transformer } from '../parser/transformer.js'
import { clearDirectory, getMatryfile, listFiles, readUTF8File, writeToJSON } from './filesystem.js'

export function build(dir: string) {
	const matryfile = getMatryfile(dir)

	if (!matryfile) {
		console.error('No Matryfile found')
		return
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
}
