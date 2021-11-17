import { template } from '../src'
import fs from 'fs'

const pdfWith2Pages = fs.readFileSync(`${__dirname}/../assets/normal.pdf`)

describe('source', () => {
  test('source can be a binary of existing pdf', async () => {
    const doc = await template({
      source: pdfWith2Pages,
      schema: [],
    })({})
    const nPages = doc.getPageCount()
    expect(nPages).toBe(2)
  })

  test('source can be an array of binary, then pages will be flattened', async () => {
    const doc = await template({
      source: [pdfWith2Pages, pdfWith2Pages],
      schema: [],
    })({})
    const nPages = doc.getPageCount()
    expect(nPages).toBe(4)
  })

  test('source can be a mixed array of binary and SizeInput, then pages will be flattened', async () => {
    const doc = await template({
      source: [pdfWith2Pages, { width: 100, height: 100 }, pdfWith2Pages],
      schema: [],
    })({})
    const nPages = doc.getPageCount()
    expect(nPages).toBe(5)
  })
})
