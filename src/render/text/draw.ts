import type { PDFPage, PDFFont } from 'pdf-lib'
import { rgb, setCharacterSpacing } from 'pdf-lib'
import { getOffset, getSize, getX, getY, pt, hex2rgb } from '../../util'
import type { TemplateSchemaItemText } from '../../template/schema'

import { getHeightOfTextAtSize, getWidthOfTextAtSize } from './size'
import { getLayout } from './layout'

export const drawText =
  (page: PDFPage) =>
  ({
    size = 8,
    lineHeight = 1.0,
    spacing: spacingMm = 0,
    align = 'left',
    verticalAlign = 'top',
    color: colorCode = '#000',
    opacity = 1.0,
    shrink = false,
    minSize = 4,
    wrap = false,
    nOfLines,
    maxLength,
    unit,
    ...schema
  }: TemplateSchemaItemText) => {
    const offset = getOffset(schema)
    const { width, height } = getSize(schema)
    const initialTextHeight = pt(size, unit)
    const minTextHeight = pt(minSize, unit)
    const color = rgb(...hex2rgb(colorCode))
    const spacing = pt(spacingMm, unit)

    return async (input: string, font: PDFFont) => {
      page.pushOperators(setCharacterSpacing(spacing))

      const { lines, size, textHeight, renderedHeight } = getLayout(
        input,
        font,
        initialTextHeight,
        lineHeight,
        spacing,
        width,
        height,
        shrink,
        minTextHeight,
        wrap,
        nOfLines,
        maxLength,
      )

      const offsetV =
        (height - renderedHeight) *
        (verticalAlign === 'top' ? 0 : verticalAlign === 'middle' ? 0.5 : 1)

      const firstLine = lines[0]
      const realHeight = firstLine
        ? getHeightOfTextAtSize(firstLine, font, size)
        : { height: 0, minY: 0 }

      const adjustY = textHeight - realHeight.height - realHeight.minY

      lines.reduce((offsetY, line, i) => {
        const textWidth = getWidthOfTextAtSize(line, font, size, spacing)

        const x = getX(offset.x, width, textWidth, align)
        const y = getY(offset.y + offsetY, page.getHeight(), textHeight)

        page.drawText(line, {
          x,
          y,
          size,
          font,
          color,
          opacity,
          wordBreaks: [''],
        })

        return offsetY + textHeight + textHeight * Math.max(0, lineHeight - 1)
      }, offsetV - adjustY)
    }
  }
