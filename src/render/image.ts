import type { PDFDocument, PDFPage } from 'pdf-lib'
import type { TemplateSchemaItemImage } from '../template/schema'
import {
  isSizeInput,
  getSize,
  getOffset,
  getX,
  getY,
  BinarySource,
  detectImageFormat,
} from '../util'

export const drawImage =
  (doc: PDFDocument, page: PDFPage) =>
  ({ opacity = 1.0, ...schema }: TemplateSchemaItemImage) => {
    const offset = getOffset(schema)

    return async (source: BinarySource) => {
      const format = detectImageFormat(source)

      if (format === 'unknown') {
        throw new Error(
          'Unknown image format detected. Only PNG or JPG can be embedded.',
        )
      }

      const image = await (format === 'jpg'
        ? doc.embedJpg(source)
        : doc.embedPng(source))

      const { width, height } = isSizeInput(schema)
        ? getSize(schema)
        : {
            width: image.width,
            height: image.height,
          }

      const x = getX(offset.x, width, width)
      const y = getY(offset.y, page.getHeight(), height)

      page.drawImage(image, {
        x,
        y,
        width,
        height,
        opacity,
      })
    }
  }
