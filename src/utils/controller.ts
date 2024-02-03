import { writeToJSON, writeToText } from './filesystem.js'

export function writeTempFile(name: string, content: any) {
	writeToJSON('.tmp', `${name}.json`, content)
}

export function writeCSSFile(name: string, content: string) {
	writeToText('bundle', `${name}.css`, content)
}
