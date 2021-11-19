import type { PDFFont } from 'pdf-lib'

export const getWidthOfTextAtSize = (
  text: string,
  font: PDFFont,
  size: number,
  spacing: number,
) => {
  const margin = Math.max(0, ([...text].length - 1) * spacing)
  return font.widthOfTextAtSize(text, size) + margin
}

export const getHeightOfTextAtSize = (
  text: string,
  font: PDFFont,
  size: number,
) => {
  const scale = size / 1000
  // @ts-ignore
  const embedder = font.embedder
  if (embedder.font && typeof embedder.font.layout === 'function') {
    const { glyphs } = embedder.font.layout(text, embedder.fontFeatures)
    return glyphs.reduce(
      (
        acc: { height: number; minY: number },
        { cbox: { maxY, minY } }: { cbox: { maxY: number; minY: number } },
      ) => {
        const height = (maxY - minY) * scale
        return acc.height < height ? { height, minY: minY * scale } : acc
      },
      { height: 0, minY: 0 },
    ) as { height: number; minY: number }
  }

  return { height: font.heightAtSize(size), minY: 0 }
}
