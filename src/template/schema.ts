import type { SizeInput, OffsetInput, Unit } from '../util'

export type TemplateSchemaItemText = {
  type: 'text'
  size?: number
  font?: string
  align?: 'left' | 'center' | 'right'
  verticalAlign?: 'top' | 'middle' | 'bottom'
  lineHeight?: number
  color?: string
  opacity?: number
  spacing?: number
  shrink?: boolean
  minSize?: number
  wrap?: boolean
  nOfLines?: number
  maxLength?: number
} & SizeInput &
  OffsetInput

export type TemplateSchemaItemRectangle = {
  type: 'rect'
  color?: string
  borderColor?: string
  borderWidth?: number
  opacity?: number
  borderOpacity?: number
} & SizeInput &
  OffsetInput

export type TemplateSchemaItemLine = {
  type: 'line'
  start: {
    x: number
    y: number
  }
  end: {
    x: number
    y: number
  }
  unit?: Unit
  color?: string
  opacity?: number
  lineWidth?: number
}

export type TemplateSchemaItemImage = {
  type: 'image'
  format: 'jpg' | 'png'
  opacity?: number
} & Partial<SizeInput> &
  OffsetInput

export type TemplateSchemaItem =
  | TemplateSchemaItemText
  | TemplateSchemaItemRectangle
  | TemplateSchemaItemLine
  | TemplateSchemaItemImage

export type TemplateSchema<
  K extends string = string,
  V extends TemplateSchemaItem = TemplateSchemaItem,
> = Record<K, V>
