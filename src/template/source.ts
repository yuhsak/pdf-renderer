import { PDFDocument, TransformationMatrix } from 'pdf-lib'
import { SizeInput, getSize, isBinarySource, BinarySource } from '../util'

export type DocumentSource = BinarySource

export type TemplateSource = DocumentSource | SizeInput

export const isDocumentSource = (
  source: TemplateSource,
): source is DocumentSource => {
  return isBinarySource(source)
}

export const getPagesFromSource =
  (doc: PDFDocument) => async (source: TemplateSource) => {
    if (!isDocumentSource(source)) {
      const size = getSize(source)
      const page = doc.addPage([size.width, size.height])
      return [page]
    }
    const baseDoc = await PDFDocument.load(source)
    const pages = baseDoc.getPages()
    const boxes = pages.map((page) => ({
      mediaBox: page.getMediaBox(),
      bleedBox: page.getBleedBox(),
      trimBox: page.getTrimBox(),
    }))
    const boundingBoxes = boxes.map(
      ({ mediaBox: { x, y, width, height } }) => ({
        left: x,
        bottom: y,
        right: width,
        top: y + height,
      }),
    )
    const transformationMatrices = pages.map(
      () => [1, 0, 0, 1, 0, 0] as TransformationMatrix,
    )
    const embeddedPages = await doc.embedPages(
      pages,
      boundingBoxes,
      transformationMatrices,
    )
    return embeddedPages.map((embedded, i) => {
      const page = doc.addPage([embedded.width, embedded.height])
      page.drawPage(embedded)
      const { mediaBox: m, bleedBox: b, trimBox: t } = boxes[i]!
      page.setMediaBox(m.x, m.y, m.width, m.height)
      page.setBleedBox(b.x, b.y, b.width, b.height)
      page.setTrimBox(t.x, t.y, t.width, t.height)
      return page
    })
  }
