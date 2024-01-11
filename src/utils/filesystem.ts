import fs from 'fs'
import path from 'path'

interface FileInfo {
  path: string
  type: string
}

function getFileExtension(filePath: string): string {
  return path.extname(filePath).slice(1)
}

export function listFiles(dir: string, fileMap: {[key: string]: FileInfo}): {[key: string]: FileInfo} {
  const files = fs.readdirSync(dir)

  files.forEach((file) => {
    const absolutePath = path.resolve(dir, file)
    const stats = fs.statSync(absolutePath)

    if (stats.isDirectory()) {
      listFiles(absolutePath, fileMap)
    } else {
      const fileType = getFileExtension(absolutePath)
      fileMap[absolutePath] = { path: absolutePath, type: fileType }
    }
  })

  return fileMap
}

export function readUTF8File(fileInfo: FileInfo, type: string): string | null {
  if (fileInfo.type === type) {
    try {
      const content = fs.readFileSync(fileInfo.path, 'utf-8')
      return content
    } catch (error) {
      console.error(`Error reading file ${fileInfo.path}:`, error)
    }
  }

  return null
}

export function clearDirectory(dir: string) {
  const absolutePath = path.join(process.cwd(), dir)

  if (fs.existsSync(absolutePath)) {
      fs.rmSync(absolutePath, { recursive: true })
  }

  fs.mkdirSync(absolutePath)
}

export function writeToJSON(dir: string, fileName: string, data: any) {
  const absolutePath = path.join(process.cwd(), dir, fileName)
  fs.writeFileSync(absolutePath, JSON.stringify(data, null, 2))
}