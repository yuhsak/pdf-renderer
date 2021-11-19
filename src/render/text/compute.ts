import type { PDFFont } from 'pdf-lib'
import { getHeightOfTextAtSize, getWidthOfTextAtSize } from './size'

export const getRenderedHeight = (
  lines: string[],
  font: PDFFont,
  size: number,
  lineHeight: number,
) => {
  const textHeight = font.heightAtSize(size)

  const height = lines.reduce((height, line, i) => {
    return (
      height +
      textHeight -
      (i === 0
        ? textHeight - getHeightOfTextAtSize(line, font, size).height
        : 0)
    )
  }, 0)

  const margin = Math.max(
    0,
    (textHeight * lineHeight - textHeight) * (lines.length - 1),
  )

  return margin + height
}

export const getRenderedWidth = (
  lines: string[],
  font: PDFFont,
  size: number,
  spacing: number,
) => {
  return lines
    .map((line) => getWidthOfTextAtSize(line, font, size, spacing))
    .reduce((max, width) => Math.max(max, width), 0)
}
