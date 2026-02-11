import path from 'path'
import { PassThrough, Readable } from 'stream'
import archiver from 'archiver'

export async function GET() {
  const extensionPath = path.join(process.cwd(), 'extension')
  const archive = archiver('zip', { zlib: { level: 9 } })
  const stream = new PassThrough()

  archive.directory(extensionPath, false)
  archive.finalize()
  archive.pipe(stream)

  archive.on('error', () => {
    stream.destroy()
  })

  const webStream = Readable.toWeb(stream)

  return new Response(webStream, {
    headers: {
      'Content-Type': 'application/zip',
      'Content-Disposition': 'attachment; filename="ux-analyzer-extension.zip"',
    },
  })
}
