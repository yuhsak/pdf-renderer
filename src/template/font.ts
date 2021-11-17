import { StandardFonts } from 'pdf-lib'
import type { PDFDocument, PDFFont } from 'pdf-lib'
import type { TemplateSchema } from './schema'
import { isBinarySource, BinarySource } from '../util'

export type FontSource = BinarySource

export type FontSourceWithOption = { data: FontSource; subset: boolean }

export type TemplateFontSource = FontSource | FontSourceWithOption

export const isFontSource = (
  source: TemplateFontSource,
): source is FontSource => {
  return isBinarySource(source)
}

export const withOption = (
  source: TemplateFontSource,
): FontSourceWithOption => {
  return isFontSource(source) ? { data: source, subset: true } : source
}

export type TemplateFont = Record<string, TemplateFontSource>

const defaultFontKey = '__default__'

export const getDefaultFont = (font: Record<string, PDFFont>) =>
  font[defaultFontKey]!

export const embedFonts = <S extends readonly TemplateSchema[]>(
  font: TemplateFont,
  schema: S,
  defaultFontSource: TemplateFontSource = StandardFonts.Helvetica,
) => {
  return async (doc: PDFDocument) => {
    return schema.reduce((promise, schema) => {
      return Object.entries(schema).reduce(async (promise, [key, item]) => {
        const acc = await promise
        if (item.type === 'text') {
          const inputTemplateFontSource = item.font ? font[item.font] : void 0
          const templateFontSource =
            inputTemplateFontSource || defaultFontSource
          const fontKey = inputTemplateFontSource ? item.font! : defaultFontKey
          if (!acc[fontKey]) {
            const fontSource = withOption(templateFontSource)
            const embedded = await doc.embedFont(fontSource.data, {
              subset: fontSource.subset,
            })
            return { ...acc, [fontKey]: embedded }
          }
        }
        return acc
      }, promise)
    }, Promise.resolve({}) as Promise<Record<string, PDFFont>>)
  }
}
