import { template } from '../src'

const source = { width: 100, height: 100 }
const empty = template({ source, schema: [] })({}).then((doc) => doc.save())

describe('line', () => {
  test('renders line', async () => {
    const emptyBinary = await empty
    const [binary] = await template({
      source,
      schema: [
        { line: { type: 'line', start: { x: 0, y: 0 }, end: { x: 0, y: 0 } } },
      ],
    })([{ line: true }]).then((docs) =>
      Promise.all(docs.map((doc) => doc.save())),
    )
    expect(binary.byteLength).not.toEqual(emptyBinary.byteLength)
  })

  test('skip if input value is false', async () => {
    const emptyBinary = await empty
    const binary = await template({
      source,
      schema: [
        { line: { type: 'line', start: { x: 0, y: 0 }, end: { x: 0, y: 0 } } },
      ],
    })({ line: false }).then((doc) => doc.save())
    const min = emptyBinary.byteLength - 1
    const max = emptyBinary.byteLength + 1
    expect(min <= binary.byteLength && binary.byteLength <= max).toBe(true)
  })
})
