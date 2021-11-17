import type {
  TemplateSchema,
  TemplateSchemaItemText,
  TemplateSchemaItemImage,
  TemplateSchemaItemRectangle,
  TemplateSchemaItemLine,
} from './schema'
import type { BinarySource } from '../util'

export type SchemaToInput<T extends TemplateSchema> = {
  [K in keyof T]: T[K] extends TemplateSchemaItemText
    ? string | boolean
    : T[K] extends TemplateSchemaItemImage
    ? BinarySource | boolean
    : T[K] extends TemplateSchemaItemRectangle
    ? boolean
    : T[K] extends TemplateSchemaItemLine
    ? boolean
    : string | BinarySource | boolean
}

export type UnionToIntersection<U> = (
  U extends any ? (k: U) => void : never
) extends (k: infer I) => void
  ? I
  : never

export type TemplateInput<S extends readonly TemplateSchema[]> =
  UnionToIntersection<
    {
      [N in keyof S]: S[N] extends TemplateSchema ? SchemaToInput<S[N]> : never
    }[number]
  >
