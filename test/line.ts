import { template } from '../src'

const source = { width: 100, height: 100 }
const empty = template({ source, schema: [] })({}).then((doc) =>
  doc.save().then((bin) => [...bin]),
)

describe('line', () => {
  test('renders line', async () => {
    const emptyBinary = await empty
    const [binary] = await template({
      source,
      schema: [
        { line: { type: 'line', start: { x: 0, y: 0 }, end: { x: 0, y: 0 } } },
      ],
    })([{ line: true }]).then((docs) =>
      Promise.all(docs.map((doc) => doc.save().then((bin) => [...bin]))),
    )
    expect(binary).not.toEqual(emptyBinary)
  })

  test('skip if input value is false', async () => {
    const [binary1, binary2] = await template({
      source,
      schema: [
        { line: { type: 'line', start: { x: 0, y: 0 }, end: { x: 0, y: 0 } } },
      ],
    })([{ line: false }, { line: true }]).then((docs) =>
      Promise.all(docs.map((doc) => doc.save().then((bin) => [...bin]))),
    )
    expect(binary1).not.toEqual(binary2)
  })
})
