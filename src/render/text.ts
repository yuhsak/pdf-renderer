import type { PDFPage, PDFFont } from 'pdf-lib'
import { rgb } from 'pdf-lib'
import { getOffset, getSize, calcX, calcY, pt, hex2rgb } from '../util'
import type { TemplateSchemaItemText } from '../template/schema'

const getLines = (
  input: string,
  font: PDFFont,
  size: number,
  containerWidth: number,
) => {
  return input.split(/\r\n|\r|\n/).flatMap((line) => {
    return [...line].reduce(
      (acc, char) => {
        const text = acc[acc.length - 1]! + char
        const textWidth = font.widthOfTextAtSize(text, size)
        if (textWidth < containerWidth) {
          acc[acc.length - 1] = text
        } else {
          acc.push(char)
        }
        return acc
      },
      [''],
    )
  })
}

const getRenderedHeight = (
  lines: string[],
  textHeight: number,
  lineHeight: number,
) => {
  return lines.reduce((acc, line, i) => {
    const margin = (textHeight * lineHeight - textHeight) * Math.min(1, i)
    return acc + textHeight + margin
  }, 0)
}

const getAdjustedLines = (
  input: string,
  font: PDFFont,
  textHeight: number,
  lineHeight: number,
  containerWidth: number,
  containerHeight: number,
  minTextHeight: number,
  shrink: boolean,
) => {
  let size = font.sizeAtHeight(textHeight)
  let lines = getLines(input, font, size, containerWidth)

  if (!shrink) {
    return {
      textHeight,
      size,
      lines,
    }
  }

  let renderedHeight = getRenderedHeight(lines, textHeight, lineHeight)
  while (renderedHeight > containerHeight && textHeight > minTextHeight) {
    textHeight *= 0.95
    size = font.sizeAtHeight(textHeight)
    lines = getLines(input, font, size, containerWidth)
    renderedHeight = getRenderedHeight(lines, textHeight, lineHeight)
  }

  return {
    textHeight,
    size,
    lines,
  }
}

export const drawText =
  (page: PDFPage) =>
  ({
    lineHeight = 1.0,
    size = 14,
    minSize = 4,
    shrink = true,
    align = 'left',
    color = '#000',
    opacity = 1.0,
    ...schema
  }: TemplateSchemaItemText) => {
    const offset = getOffset(schema)
    const { width, height } = getSize(schema)
    const textHeight = pt(size, schema.unit)
    const minTextHeight = pt(minSize, schema.unit)
    const [r, g, b] = hex2rgb(color)

    return async (input: string, font: PDFFont) => {
      const {
        lines,
        size,
        textHeight: adjustedTextHeight,
      } = getAdjustedLines(
        input,
        font,
        textHeight,
        lineHeight,
        width,
        height,
        minTextHeight,
        shrink,
      )

      lines.map((line, i) => {
        const textWidth = font.widthOfTextAtSize(line, size)
        const x = calcX(offset.x, width, textWidth, align)
        const y = calcY(
          offset.y + adjustedTextHeight * lineHeight * i,
          page.getHeight(),
          adjustedTextHeight,
        )
        page.drawText(line, {
          x,
          y,
          size,
          font,
          maxWidth: width,
          color: rgb(r, g, b),
          opacity,
        })
      })
    }
  }
