import type { PDFPage } from 'pdf-lib'
import type { TemplateSchemaItemRectangle } from '../template/schema'
import { rgb } from 'pdf-lib'
import { getSize, getOffset, pt, hex2rgb, getX, getY } from '../util'

export const getRectangleLayout = (
  x: number,
  y: number,
  width: number,
  height: number,
  borderWidth: number,
) => {
  return {
    x: x + borderWidth / 2,
    y: y + borderWidth / 2,
    width: width - borderWidth,
    height: height - borderWidth,
  }
}

export const drawRectangle =
  (page: PDFPage) =>
  ({
    borderColor = '#000',
    borderWidth = 1,
    opacity = 1.0,
    borderOpacity = 1.0,
    ...schema
  }: TemplateSchemaItemRectangle) => {
    const offset = getOffset(schema)
    const { width, height } = getSize(schema)
    const borderWidthPt = pt(borderWidth, schema.unit)
    const borderColorRgb = rgb(...hex2rgb(borderColor))
    const colorRgb = schema.color ? rgb(...hex2rgb(schema.color)) : void 0

    return async () => {
      const x = getX(offset.x, width, width)
      const y = getY(offset.y, page.getHeight(), height)
      page.drawRectangle({
        ...getRectangleLayout(x, y, width, height, borderWidthPt),
        borderWidth: borderWidthPt,
        borderColor: borderColorRgb,
        color: colorRgb,
        opacity,
        borderOpacity,
      })
    }
  }
