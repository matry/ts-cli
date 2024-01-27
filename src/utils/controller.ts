import { Transformer } from '../parser/transformer.js'
import { getMatryProject, writeToJSON } from './filesystem.js'

export function parse(dir: string) {
	const concatFiles = getMatryProject(dir)

	try {
		const transformer = new Transformer(concatFiles)
		return transformer.transform()
	} catch (error: any) {
		throw new Error(`Compilation error:
		${error.message}
		`)
	}
}

export function writeToDisk(content: any) {
	writeToJSON('.tmp', 'tmp.json', content)
}
