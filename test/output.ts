import { template } from '../src'

describe('output', () => {
  test('returns single doc when it gives a single input', async () => {
    const doc = await template({
      source: { width: 100, height: 100 },
      schema: [],
    })({})
    const base64 = await doc.saveAsBase64()
    expect(typeof base64).toBe('string')
  })

  test('returns multiple docs when it gives an array of input', async () => {
    const docs = await template({
      source: { width: 100, height: 100 },
      schema: [],
    })([{}, {}])
    expect(docs).toHaveLength(2)
  })

  test('returned doc has a single page when it gives a single SizeInput as source', async () => {
    const doc = await template({
      source: { width: 100, height: 100 },
      schema: [],
    })({})
    const nPages = doc.getPageCount()
    expect(nPages).toBe(1)
  })

  test('returned doc has multiple pages when it gives an array of SizeInput as source', async () => {
    const doc = await template({
      source: [
        { width: 100, height: 100 },
        { width: 100, height: 100 },
      ],
      schema: [],
    })({})
    const nPages = doc.getPageCount()
    expect(nPages).toBe(2)
  })

  test('ignore unusable schema', async () => {
    const empty = await template({
      source: { width: 100, height: 100 },
      schema: [],
    })({})
      .then((doc) => doc.save())
      .then((bin) => bin.byteLength)

    const unusable = await template({
      source: { width: 100, height: 100 },
      schema: [
        {},
        { rect: { type: 'rect', x: 0, y: 0, width: 100, height: 100 } },
      ],
    })({ rect: true })
      .then((doc) => doc.save())
      .then((bin) => bin.byteLength)

    expect(empty).toEqual(unusable)
  })

  test('ignores unknown schema type', async () => {
    const empty = await template({
      source: { width: 100, height: 100 },
      schema: [],
    })({})
      .then((doc) => doc.save())
      .then((bin) => bin.byteLength)

    const unknown = await template({
      source: { width: 100, height: 100 },
      // @ts-expect-error
      schema: [{ text: { type: 'unknown' } }],
    })({ text: 'ok' })
      .then((doc) => doc.save())
      .then((bin) => bin.byteLength)

    expect(empty).toEqual(unknown)
  })
})
