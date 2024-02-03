import { writeToJSON } from './filesystem.js'

export function writeTempFile(name: string, content: any) {
	writeToJSON('.tmp', `${name}.json`, content)
}
