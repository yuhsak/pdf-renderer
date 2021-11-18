import { isString, isArrayBuffer, isUint8Array, isBuffer } from 'what-is-that'

export type BinarySource = Uint8Array | ArrayBuffer | Buffer | string

export const isBinarySource = (b: unknown): b is BinarySource => {
  return isString(b) || isArrayBuffer(b) || isUint8Array(b) || isBuffer(b)
}

export const hex2rgb = (code: string): [number, number, number] => {
  let hex = code.replace(/#/g, '')
  if (hex.length === 3) {
    hex = hex[0]! + hex[0] + hex[1] + hex[1] + hex[2] + hex[2]
  }
  if (hex.length === 6) {
    return [hex.slice(0, 2), hex.slice(2, 4), hex.slice(4, 6)].map(
      (hex) => parseInt(hex, 16) / 255,
    ) as [number, number, number]
  }
  throw new Error(
    `Color must be hex color code with 3 or 6 characters optionally starting with #, got: ${code}`,
  )
}

export const mm2pt = (mm: number) => mm * 2.8346

export type Unit = 'pt' | 'mm'

export const pt = (value: number, unit?: Unit) =>
  unit === 'pt' ? value : mm2pt(value)

export type Size = {
  width: number
  height: number
}

export type Offset = {
  x: number
  y: number
}

export type SizeInput = {
  unit?: 'pt' | 'mm'
  width: number
  height: number
}

export type OffsetInput = {
  unit?: 'pt' | 'mm'
  x: number
  y: number
}

export const isSizeInput = (
  option: Partial<SizeInput>,
): option is SizeInput => {
  if (option.width !== void 0 && option.height !== void 0) return true
  return false
}

export const getSize = ({ unit, ...input }: SizeInput): Size => {
  const width = pt(input.width, unit)
  const height = pt(input.height, unit)
  return { width, height }
}

export const getOffset = ({ unit, ...input }: OffsetInput): Offset => {
  const x = pt(input.x, unit)
  const y = pt(input.y, unit)
  return { x, y }
}

export const getX = (
  x: number,
  containerWidth: number,
  contentWidth: number,
  align: 'left' | 'center' | 'right' = 'left',
) => {
  const diff = containerWidth - contentWidth
  const offset = align === 'left' ? 0 : align === 'center' ? diff / 2 : diff
  return x + offset
}

export const getY = (
  y: number,
  containerHeight: number,
  contentHeight: number,
) => {
  return containerHeight - contentHeight - y
}
