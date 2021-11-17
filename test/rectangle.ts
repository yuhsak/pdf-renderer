import { template } from '../src'

const source = { width: 100, height: 100 }
const empty = template({ source, schema: [] })({}).then((doc) => doc.save())

describe('rectangle', () => {
  test('renders rectangle', async () => {
    const emptyBinary = await empty
    const [binary] = await template({
      source,
      schema: [{ rect: { type: 'rect', x: 0, y: 0, width: 100, height: 100 } }],
    })([{ rect: true }]).then((docs) =>
      Promise.all(docs.map((doc) => doc.save())),
    )
    expect(binary.byteLength).not.toEqual(emptyBinary.byteLength)
  })

  test('skip if input value is false', async () => {
    const emptyBinary = await empty
    const binary = await template({
      source,
      schema: [{ rect: { type: 'rect', x: 0, y: 0, width: 100, height: 100 } }],
    })({ rect: false }).then((doc) => doc.save())
    const min = emptyBinary.byteLength - 1
    const max = emptyBinary.byteLength + 1
    expect(min <= binary.byteLength && binary.byteLength <= max).toBe(true)
  })

  test('color', async () => {
    const binary1 = await template({
      source,
      schema: [
        {
          rect: {
            type: 'rect',
            x: 0,
            y: 0,
            width: 100,
            height: 100,
            color: '#f00',
          },
        },
      ],
    })({ rect: true }).then((doc) => doc.save())
    const binary2 = await template({
      source,
      schema: [
        {
          rect: {
            type: 'rect',
            x: 0,
            y: 0,
            width: 100,
            height: 100,
          },
        },
      ],
    })({ rect: true }).then((doc) => doc.save())
    expect(binary1.byteLength).not.toEqual(binary2.byteLength)
  })

  test('borderOpacity', async () => {
    const binary1 = await template({
      source,
      schema: [
        {
          rect: {
            type: 'rect',
            x: 0,
            y: 0,
            width: 100,
            height: 100,
            opacity: 0.5,
          },
        },
      ],
    })({ rect: true }).then((doc) => doc.save())
    const binary2 = await template({
      source,
      schema: [
        {
          rect: {
            type: 'rect',
            x: 0,
            y: 0,
            width: 100,
            height: 100,
            opacity: 0.5,
            borderOpacity: 0.5,
          },
        },
      ],
    })({ rect: true }).then((doc) => doc.save())
    const binary3 = await template({
      source,
      schema: [
        {
          rect: {
            type: 'rect',
            x: 0,
            y: 0,
            width: 100,
            height: 100,
            opacity: 0.5,
            borderOpacity: 0.8,
          },
        },
      ],
    })({ rect: false }).then((doc) => doc.save())
    expect(binary1.byteLength).toEqual(binary2.byteLength)
    expect(binary1.byteLength).not.toEqual(binary3.byteLength)
  })
})
