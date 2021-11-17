import { template } from '../src'

const source = { width: 100, height: 100 }

describe('text', () => {
  test('renders text', async () => {
    const emptyBinary = await template({ source, schema: [] })({}).then((doc) =>
      doc.save(),
    )
    const [binary1, binary2] = await template({
      source,
      schema: [{ text: { type: 'text', x: 0, y: 0, width: 100, height: 100 } }],
    })([{ text: 'Test 1' }, { text: 'Test 10' }]).then((docs) =>
      Promise.all(docs.map((doc) => doc.save())),
    )
    expect(emptyBinary.byteLength).not.toEqual(binary1.byteLength)
    expect(emptyBinary.byteLength).not.toEqual(binary2.byteLength)
    expect(binary1.byteLength).not.toEqual(binary2.byteLength)
  })

  test('skip if input value is boolean or binary', async () => {
    const binary1 = await template({
      source,
      schema: [{ text: { type: 'text', x: 0, y: 0, width: 100, height: 100 } }],
    })({ text: false }).then((doc) => doc.save())
    const binary2 = await template({
      source,
      schema: [
        { text: { type: 'text', x: 50, y: 50, width: 100, height: 100 } },
      ],
    })({ text: false }).then((doc) => doc.save())
    const binary3 = await template({
      source,
      schema: [
        { text: { type: 'text', x: 50, y: 50, width: 100, height: 100 } },
      ],
    })({ text: true }).then((doc) => doc.save())
    const t = template({
      source,
      schema: [
        { text: { type: 'text', x: 50, y: 50, width: 100, height: 100 } },
      ],
    })
    // @ts-expect-error
    const binary4 = await t({ text: new Uint8Array() }).then((doc) =>
      doc.save(),
    )
    const min = binary1.byteLength - 1
    const max = binary1.byteLength + 1
    expect(min <= binary2.byteLength && binary2.byteLength <= max).toBe(true)
    expect(min <= binary3.byteLength && binary3.byteLength <= max).toBe(true)
    expect(min <= binary4.byteLength && binary4.byteLength <= max).toBe(true)
  })

  test('rejects if color is invalid', () => {
    expect(
      template({
        source,
        schema: [
          {
            text: {
              type: 'text',
              x: 50,
              y: 50,
              width: 100,
              height: 100,
              color: '#0000',
            },
          },
        ],
      })({ text: 'error' }),
    ).rejects.toThrowError()
  })

  test('works with align', async () => {
    const binary1 = await template({
      source,
      schema: [
        {
          text: {
            type: 'text',
            x: 0,
            y: 0,
            width: 100,
            height: 100,
            align: 'left',
          },
        },
      ],
    })({ text: 'a' }).then((doc) => doc.save())
    const binary2 = await template({
      source,
      schema: [
        {
          text: {
            type: 'text',
            x: 50,
            y: 50,
            width: 100,
            height: 100,
            align: 'right',
          },
        },
      ],
    })({ text: 'a' }).then((doc) => doc.save())
    const binary3 = await template({
      source,
      schema: [
        {
          text: {
            type: 'text',
            x: 50,
            y: 50,
            width: 100,
            height: 100,
            align: 'center',
          },
        },
      ],
    })({ text: 'a' }).then((doc) => doc.save())
    expect(binary1.byteLength).not.toEqual(binary2.byteLength)
    expect(binary1.byteLength).not.toEqual(binary3.byteLength)
    expect(binary2.byteLength).not.toEqual(binary3.byteLength)
  })

  test('works with unit', async () => {
    const binary1 = await template({
      source,
      schema: [
        {
          text: {
            type: 'text',
            x: 0,
            y: 0,
            width: 100,
            height: 100,
            unit: 'pt',
          },
        },
      ],
    })({ text: 'a' }).then((doc) => doc.save())
    const binary2 = await template({
      source,
      schema: [
        {
          text: {
            type: 'text',
            x: 50,
            y: 50,
            width: 100,
            height: 100,
          },
        },
      ],
    })({ text: 'a' }).then((doc) => doc.save())
    expect(binary1.byteLength).not.toEqual(binary2.byteLength)
  })

  test('shrink if rendered height exceeds container height', async () => {
    const notShrink = await template({
      source,
      schema: [
        {
          text: {
            type: 'text',
            x: 0,
            y: 0,
            width: 10,
            height: 10,
            shrink: false,
          },
        },
      ],
    })({ text: 'a'.repeat(100) }).then((doc) => doc.save())

    const shrink = await template({
      source,
      schema: [
        {
          text: {
            type: 'text',
            x: 0,
            y: 0,
            width: 10,
            height: 10,
          },
        },
      ],
    })({ text: 'a'.repeat(100) }).then((doc) => doc.save())

    const shrinkMore = await template({
      source,
      schema: [
        {
          text: {
            type: 'text',
            x: 0,
            y: 0,
            width: 10,
            height: 10,
            minSize: 1,
          },
        },
      ],
    })({ text: 'a'.repeat(100) }).then((doc) => doc.save())

    expect(shrink.byteLength).not.toEqual(notShrink.byteLength)
    expect(shrink.byteLength).not.toEqual(shrinkMore.byteLength)
  })
})
