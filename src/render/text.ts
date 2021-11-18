import type { PDFPage, PDFFont } from 'pdf-lib'
import { rgb, setCharacterSpacing } from 'pdf-lib'
import { getOffset, getSize, getX, getY, pt, mm2pt, hex2rgb } from '../util'
import type { TemplateSchemaItemText } from '../template/schema'

const getWidthOfTextAtSize = (
  text: string,
  font: PDFFont,
  size: number,
  spacing: number,
) => {
  const margin = Math.max(0, ([...text].length - 1) * spacing)
  return font.widthOfTextAtSize(text, size) + margin
}

const getRenderedHeight = (
  lines: string[],
  textHeight: number,
  lineHeight: number,
) => {
  const margin = Math.max(
    0,
    (textHeight * lineHeight - textHeight) * (lines.length - 1),
  )
  const height = textHeight * lines.length
  return margin + height
}

const getRenderedWidth = (
  lines: string[],
  font: PDFFont,
  size: number,
  spacing: number,
) => {
  return lines
    .map((line) => getWidthOfTextAtSize(line, font, size, spacing))
    .reduce((max, width) => Math.max(max, width), 0)
}

const fold = (
  text: string,
  font: PDFFont,
  size: number,
  spacing: number,
  containerWidth: number,
) => {
  let renderedWidth = getWidthOfTextAtSize(text, font, size, spacing)
  let newLine = ''

  while (containerWidth < renderedWidth) {
    const length = [...text].length
    const diff = renderedWidth - containerWidth
    const ratio = diff / renderedWidth
    const nMaybeExceeds =
      renderedWidth <= 0 || diff <= 0
        ? 0
        : Math.max(1, Math.floor(length * ratio))
    newLine = text.slice(-1 * nMaybeExceeds) + newLine
    text = text.slice(0, length - nMaybeExceeds)
    renderedWidth = getWidthOfTextAtSize(text, font, size, spacing)
  }

  return newLine ? [text, newLine] : [text]
}

const getWrappedLines = (
  lines: string[],
  font: PDFFont,
  size: number,
  spacing: number,
  containerWidth: number,
  nOfLines?: number,
) => {
  return lines.reduce((acc, line, i, lines) => {
    let folded = [line]
    let foldable =
      !nOfLines || Math.max(acc.length + folded.length, lines.length) < nOfLines
    let maybeBeFolded = true

    while (foldable && maybeBeFolded) {
      const nextFolded = fold(
        folded.slice(-1)[0]!,
        font,
        size,
        spacing,
        containerWidth,
      )
      folded = [...folded.slice(0, -1), ...nextFolded]
      foldable =
        !nOfLines ||
        Math.max(acc.length + folded.length, lines.length) < nOfLines
      maybeBeFolded = 1 < nextFolded.length
    }

    return [...acc, ...folded]
  }, [] as string[])
}

const getLayout = (
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

  if (!shrink) {
    return {
      textHeight,
      size,
      lines,
    }
  }

  let renderedHeight = getRenderedHeight(lines, textHeight, lineHeight)
  let renderedWidth = getRenderedWidth(lines, font, size, spacing)
  while (
    (renderedHeight > containerHeight || renderedWidth > containerWidth) &&
    textHeight > minTextHeight
  ) {
    textHeight -= mm2pt(1)
    size = font.sizeAtHeight(textHeight)
    lines = getLines(preWrapped, font, size, spacing, containerWidth, nOfLines)
    renderedHeight = getRenderedHeight(lines, textHeight, lineHeight)
    renderedWidth = getRenderedWidth(lines, font, size, spacing)
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
    size = 8,
    lineHeight = 1.0,
    spacing: spacingMm = 0,
    align = 'left',
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

      const { lines, size, textHeight } = getLayout(
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

      lines.map((line, i) => {
        const textWidth = getWidthOfTextAtSize(line, font, size, spacing)
        const x = getX(offset.x, width, textWidth, align)
        const y = getY(
          offset.y + textHeight * lineHeight * i,
          page.getHeight(),
          textHeight,
        )

        page.drawText(line, {
          x,
          y,
          size,
          font,
          color,
          opacity,
          wordBreaks: [''],
        })
      })
    }
  }
