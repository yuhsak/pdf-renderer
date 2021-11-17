import { isArray } from 'what-is-that'
import { PDFDocument, PDFPage, StandardFonts } from 'pdf-lib'
import fontkit from '@pdf-lib/fontkit'
import type { TemplateSchema } from './schema'
import type { TemplateSource } from './source'
import type { TemplateFont } from './font'
import type { TemplateInput } from './input'
import type { BinarySource } from '../util'
import { embedFonts, getDefaultFont } from './font'
import { getPagesFromSource } from './source'
import { drawText, drawRectangle, drawLine, drawImage } from '../render'

export type Template<S extends readonly TemplateSchema[]> = {
  source: TemplateSource | TemplateSource[]
  schema: S
  font?: TemplateFont
}

export const template = <S extends readonly TemplateSchema[]>({
  source,
  schema,
  font,
}: Template<S>) => {
  const sources = isArray(source) ? source : [source]
  const getFont = embedFonts({ ...font }, schema)

  async function render(input: TemplateInput<S>): Promise<PDFDocument>
  async function render(input: TemplateInput<S>[]): Promise<PDFDocument[]>
  async function render(
    input: TemplateInput<S> | TemplateInput<S>[],
  ): Promise<PDFDocument | PDFDocument[]> {
    const inputs = isArray(input) ? input : [input]

    const docs = await Promise.all(
      inputs.map(async (input) => {
        const doc = await PDFDocument.create()
        doc.registerFontkit(fontkit)

        const fontData = await getFont(doc)
        const getPages = getPagesFromSource(doc)

        const pages = await sources.reduce(async (promise, source) => {
          const acc = await promise
          const pages = await getPages(source)
          return [...acc, ...pages]
        }, Promise.resolve([]) as Promise<PDFPage[]>)

        await Promise.all(
          schema.map(async (schema, i) => {
            const page = pages[i]
            if (!page) return void 0
            const text = drawText(page)
            const rect = drawRectangle(page)
            const line = drawLine(page)
            const image = drawImage(doc, page)

            return Object.entries(schema).reduce(
              async (promise, [key, schema]) => {
                await promise
                const value = (
                  input as Record<string, BinarySource | string | boolean>
                )[key]
                if (value === void 0 || value === false) return
                if (schema.type === 'text') {
                  if (value === true || !(typeof value === 'string')) return
                  const schemaFont =
                    schema.font !== void 0 ? fontData[schema.font] : void 0
                  const font = schemaFont || getDefaultFont(fontData)
                  return text(schema)(value, font)
                }
                if (schema.type === 'rect') {
                  return rect(schema)()
                }
                if (schema.type === 'line') {
                  return line(schema)()
                }
                if (schema.type === 'image') {
                  if (value === true) return
                  return image(schema)(value)
                }
                return promise
              },
              Promise.resolve<void>(void 0),
            )
          }),
        )

        return doc
      }),
    )

    return isArray(input) ? docs : docs[0]!
  }

  return render
}
