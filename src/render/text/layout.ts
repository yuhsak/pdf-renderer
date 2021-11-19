import type { PDFFont } from 'pdf-lib'
import { mm2pt } from '../../util'
import { getWrappedLines } from './wrap'
import { getRenderedHeight, getRenderedWidth } from './compute'

export const getLayout = (
  input: string,
  font: PDFFont,
  textHeight: number,
  lineHeight: number,
  spacing: number,
  containerWidth: number,
  containerHeight: number,
  shrink: boolean,
  minTextHeight: number,
  wrap: boolean,
  nOfLines?: number,
  maxLength?: number,
) => {
  const getLines = (
    lines: string[],
    font: PDFFont,
    size: number,
    spacing: number,
    containerWidth: number,
    nOfLines?: number,
  ) => {
    return wrap && (nOfLines === void 0 || nOfLines > 1)
      ? getWrappedLines(lines, font, size, spacing, containerWidth, nOfLines)
      : lines
  }

  const preWrapped = input.split(/\r\n|\r|\n/).map((line) => {
    return maxLength ? line.slice(0, maxLength) : line
  })

  let size = font.sizeAtHeight(textHeight)
  let lines = getLines(
    preWrapped,
    font,
    size,
    spacing,
    containerWidth,
    nOfLines,
  )

  let renderedHeight = getRenderedHeight(lines, font, size, lineHeight)

  if (!shrink) {
    return {
      textHeight,
      renderedHeight,
      size,
      lines,
    }
  }

  let renderedWidth = getRenderedWidth(lines, font, size, spacing)
  while (
    (renderedHeight > containerHeight || renderedWidth > containerWidth) &&
    textHeight > minTextHeight
  ) {
    textHeight -= mm2pt(1)
    size = font.sizeAtHeight(textHeight)
    lines = getLines(preWrapped, font, size, spacing, containerWidth, nOfLines)
    renderedHeight = getRenderedHeight(lines, font, size, lineHeight)
    renderedWidth = getRenderedWidth(lines, font, size, spacing)
  }

  return {
    textHeight,
    renderedHeight,
    size,
    lines,
  }
}
