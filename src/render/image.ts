import type { PDFDocument, PDFPage } from 'pdf-lib'
import type { TemplateSchemaItemImage } from '../template/schema'
import {
  isSizeInput,
  getSize,
  getOffset,
  getX,
  getY,
  BinarySource,
} from '../util'

export const drawImage =
  (doc: PDFDocument, page: PDFPage) =>
  ({ format, opacity = 1.0, ...schema }: TemplateSchemaItemImage) => {
    const offset = getOffset(schema)

    return async (source: BinarySource) => {
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
