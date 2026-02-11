import path from 'path'
import fs from 'fs'
import { readdir } from 'fs/promises'
import { PassThrough, Readable } from 'stream'
import archiver from 'archiver'

const getExtensionFiles = async (rootPath) => {
  const entries = await readdir(rootPath, { withFileTypes: true })
  const files = []

  for (const entry of entries) {
    const fullPath = path.join(rootPath, entry.name)
    if (entry.isDirectory()) {
      files.push(...await getExtensionFiles(fullPath))
    } else {
      files.push(fullPath)
    }
  }

  return files
}

export async function GET() {
  const extensionPath = path.join(process.cwd(), 'extension')
  const archive = archiver('zip', { zlib: { level: 9 } })
  const stream = new PassThrough()
  const appUrl = (process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000').replace(/\/+$/, '')
  const replaceFiles = new Set(['popup.js', 'popup.html', 'manifest.json'])

  archive.on('error', () => {
    stream.destroy()
  })

  archive.pipe(stream)

  const files = await getExtensionFiles(extensionPath)
  for (const filePath of files) {
    const fileName = path.basename(filePath)
    const relativeName = path.relative(extensionPath, filePath).replace(/\\/g, '/')

    if (replaceFiles.has(fileName)) {
      const content = await fs.promises.readFile(filePath, 'utf-8')
      const updatedContent = content.replaceAll('http://localhost:3000', appUrl)
      archive.append(updatedContent, { name: relativeName })
    } else {
      archive.file(filePath, { name: relativeName })
    }
  }

  archive.finalize()

  const webStream = Readable.toWeb(stream)

  return new Response(webStream, {
    headers: {
      'Content-Type': 'application/zip',
      'Content-Disposition': 'attachment; filename="ux-analyzer-extension.zip"',
    },
  })
}
