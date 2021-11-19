import type { PDFFont } from 'pdf-lib'
import { getWidthOfTextAtSize } from './size'

export const fold = (
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

export const getWrappedLines = (
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
