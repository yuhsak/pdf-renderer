import { template } from '../src'

const source = { width: 100, height: 100 }

describe('text', () => {
  test('renders text', async () => {
    const emptyBinary = await template({ source, schema: [] })({}).then((doc) =>
      doc.save().then((bin) => [...bin]),
    )
    const [binary1, binary2] = await template({
      source,
      schema: [{ text: { type: 'text', x: 0, y: 0, width: 100, height: 100 } }],
    })([{ text: 'Test 1' }, { text: 'Test 10' }]).then((docs) =>
      Promise.all(docs.map((doc) => doc.save().then((bin) => [...bin]))),
    )
    expect(emptyBinary).not.toEqual(binary1)
    expect(emptyBinary).not.toEqual(binary2)
    expect(binary1).not.toEqual(binary2)
  })

  test('skip if input value is boolean or binary', async () => {
    const binary1 = await template({
      source,
      schema: [{ text: { type: 'text', x: 0, y: 0, width: 100, height: 100 } }],
    })({ text: false }).then((doc) => doc.save().then((bin) => [...bin]))
    const binary2 = await template({
      source,
      schema: [
        { text: { type: 'text', x: 50, y: 50, width: 100, height: 100 } },
      ],
    })({ text: false }).then((doc) => doc.save().then((bin) => [...bin]))
    const binary3 = await template({
      source,
      schema: [
        { text: { type: 'text', x: 50, y: 50, width: 100, height: 100 } },
      ],
    })({ text: true }).then((doc) => doc.save().then((bin) => [...bin]))
    const t = template({
      source,
      schema: [
        { text: { type: 'text', x: 50, y: 50, width: 100, height: 100 } },
      ],
    })
    // @ts-expect-error
    const binary4 = await t({ text: new Uint8Array() }).then((doc) =>
      doc.save().then((bin) => [...bin]),
    )
    expect(binary1).toEqual(binary2)
    expect(binary2).toEqual(binary3)
    expect(binary3).toEqual(binary4)
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
    })({ text: 'a' }).then((doc) => doc.save().then((bin) => [...bin]))

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
    })({ text: 'a' }).then((doc) => doc.save().then((bin) => [...bin]))

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
    })({ text: 'a' }).then((doc) => doc.save().then((bin) => [...bin]))

    expect(binary1).not.toEqual(binary2)
    expect(binary1).not.toEqual(binary3)
    expect(binary2).not.toEqual(binary3)
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
    })({ text: 'a' }).then((doc) => doc.save().then((bin) => [...bin]))

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
    })({ text: 'a' }).then((doc) => doc.save().then((bin) => [...bin]))

    expect(binary1).not.toEqual(binary2)
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
    })({ text: 'a'.repeat(100) }).then((doc) =>
      doc.save().then((bin) => [...bin]),
    )

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
            shrink: true,
          },
        },
      ],
    })({ text: 'a'.repeat(100) }).then((doc) =>
      doc.save().then((bin) => [...bin]),
    )

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
            shrink: true,
          },
        },
      ],
    })({ text: 'a'.repeat(100) }).then((doc) =>
      doc.save().then((bin) => [...bin]),
    )

    expect(shrink).not.toEqual(notShrink)
    expect(shrink).not.toEqual(shrinkMore)
  })
})
