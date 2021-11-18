import type { PDFPage } from 'pdf-lib'
import type { TemplateSchemaItemRectangle } from '../template/schema'
import { rgb } from 'pdf-lib'
import { getSize, getOffset, pt, hex2rgb, getX, getY } from '../util'

export const drawRectangle =
  (page: PDFPage) =>
  ({
    borderColor = '#000',
    borderWidth = 1,
    opacity = 1.0,
    ...schema
  }: TemplateSchemaItemRectangle) => {
    const offset = getOffset(schema)
    const { width, height } = getSize(schema)
    const borderWidthPt = pt(borderWidth, schema.unit)
    const borderOpacity =
      schema.borderOpacity === void 0 ? opacity : schema.borderOpacity
    const borderColorRgb = rgb(...hex2rgb(borderColor))
    const colorRgb = schema.color ? rgb(...hex2rgb(schema.color)) : void 0
    const innerWidthPt = width - borderWidthPt
    const innerHeightPt = height - borderWidthPt

    return async () => {
      const x = getX(offset.x, width, width) + borderWidthPt / 2
      const y = getY(offset.y, page.getHeight(), height) + borderWidthPt / 2
      page.drawRectangle({
        x,
        y,
        width: innerWidthPt,
        height: innerHeightPt,
        borderWidth: borderWidthPt,
        borderColor: borderColorRgb,
        color: colorRgb,
        opacity,
        borderOpacity,
      })
    }
  }
