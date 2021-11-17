import { template } from '../src'
import fs from 'fs'

const source = { width: 100, height: 100 }
const empty = template({ source, schema: [] })({}).then((doc) => doc.save())
const font = fs.readFileSync(`${__dirname}/../assets/Ubuntu-R.ttf`)

describe('font', () => {
  test('embedds default font', async () => {
    const empty = await template({ source, schema: [] })({}).then((doc) =>
      doc.save(),
    )
    const embedded = await template({
      source,
      schema: [{ text: { type: 'text', x: 0, y: 0, width: 100, height: 100 } }],
    })({ text: false })
      .then((doc) => doc.save())
      .then((bin) => bin.byteLength)
    expect(embedded).not.toEqual(empty)
  })

  test('embedds custom font as subset', async () => {
    const defaultFont = await template({
      source,
      schema: [
        {
          text: {
            type: 'text',
            x: 0,
            y: 0,
            width: 100,
            height: 100,
          },
        },
      ],
    })({ text: 'a' })
      .then((doc) => doc.save())
      .then((bin) => bin.byteLength)

    const customFont = await template({
      font: {
        font,
      },
      source,
      schema: [
        {
          text: {
            type: 'text',
            x: 0,
            y: 0,
            width: 100,
            height: 100,
            font: 'font',
          },
        },
      ],
    })({ text: 'a' })
      .then((doc) => doc.save())
      .then((bin) => bin.byteLength)

    expect(defaultFont).not.toEqual(customFont)
  })

  test('embedds custom font as superset', async () => {
    const subset = await template({
      font: {
        font,
      },
      source,
      schema: [
        {
          text: {
            type: 'text',
            x: 0,
            y: 0,
            width: 100,
            height: 100,
            font: 'font',
          },
        },
      ],
    })({ text: false })
      .then((doc) => doc.save())
      .then((bin) => bin.byteLength)

    const superset = await template({
      font: {
        font: {
          data: font,
          subset: false,
        },
      },
      source,
      schema: [
        {
          text: {
            type: 'text',
            x: 0,
            y: 0,
            width: 100,
            height: 100,
            font: 'font',
          },
        },
      ],
    })({ text: false })
      .then((doc) => doc.save())
      .then((bin) => bin.byteLength)

    expect(subset).not.toEqual(superset)
  })

  test('embedds default font if font not found', async () => {
    const defaultFont = await template({
      source,
      schema: [
        {
          text: {
            type: 'text',
            x: 0,
            y: 0,
            width: 100,
            height: 100,
          },
        },
      ],
    })({ text: false })
      .then((doc) => doc.save())
      .then((bin) => bin.byteLength)

    const customFont = await template({
      font: {
        font,
      },
      source,
      schema: [
        {
          text: {
            type: 'text',
            x: 0,
            y: 0,
            width: 100,
            height: 100,
            font: 'notFound',
          },
        },
      ],
    })({ text: false })
      .then((doc) => doc.save())
      .then((bin) => bin.byteLength)

    expect(defaultFont).toEqual(customFont)
  })
})
