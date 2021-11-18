import type { PDFPage } from 'pdf-lib'
import type { TemplateSchemaItemLine } from '../template/schema'
import { rgb } from 'pdf-lib'
import { getSize, getOffset, pt, hex2rgb, getX, getY } from '../util'

export const drawLine =
  (page: PDFPage) =>
  ({
    unit,
    color = '#000',
    lineWidth = 1,
    opacity = 1.0,
    ...schema
  }: TemplateSchemaItemLine) => {
    const start = getOffset({ ...schema.start, unit })
    const end = getOffset({ ...schema.end, unit })
    const lineWidthPt = pt(lineWidth, unit)
    const colorRgb = rgb(...hex2rgb(color))

    return async () => {
      page.drawLine({
        start: {
          x: start.x,
          y: page.getHeight() - start.y,
        },
        end: {
          x: end.x,
          y: page.getHeight() - end.y,
        },
        thickness: lineWidthPt,
        color: colorRgb,
        opacity,
      })
    }
  }
