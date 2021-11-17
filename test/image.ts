import { template } from '../src'
import fs from 'fs'

const source = { width: 100, height: 100 }
const empty = template({ source, schema: [] })({}).then((doc) => doc.save())
const png = fs.readFileSync(`${__dirname}/../assets/superman.png`)
const jpg = fs.readFileSync(`${__dirname}/../assets/superman.jpg`)

describe('image', () => {
  test('renders png', async () => {
    const emptyBinary = await empty
    const [binary] = await template({
      source,
      schema: [
        {
          image: {
            type: 'image',
            format: 'png',
            x: 0,
            y: 0,
            width: 100,
            height: 100,
          },
        },
      ],
    })([{ image: png }]).then((docs) =>
      Promise.all(docs.map((doc) => doc.save())),
    )
    expect(binary.byteLength).not.toEqual(emptyBinary.byteLength)
  })

  test('renders jpg', async () => {
    const emptyBinary = await empty
    const [binary] = await template({
      source,
      schema: [
        {
          image: {
            type: 'image',
            format: 'jpg',
            x: 0,
            y: 0,
            width: 100,
            height: 100,
          },
        },
      ],
    })([{ image: jpg }]).then((docs) =>
      Promise.all(docs.map((doc) => doc.save())),
    )
    expect(binary.byteLength).not.toEqual(emptyBinary.byteLength)
  })

  test('skip if input value is boolean', async () => {
    const emptyBinary = await empty
    const [binary1, binary2] = await template({
      source,
      schema: [
        {
          image: {
            type: 'image',
            format: 'png',
            x: 0,
            y: 0,
            width: 100,
            height: 100,
          },
        },
      ],
    })([{ image: false }, { image: true }]).then((docs) =>
      Promise.all(docs.map((doc) => doc.save())),
    )
    const min = emptyBinary.byteLength - 1
    const max = emptyBinary.byteLength + 1
    expect(min <= binary1.byteLength && binary1.byteLength <= max).toBe(true)
    expect(min <= binary2.byteLength && binary2.byteLength <= max).toBe(true)
  })

  test('use raw height when width and height both are not specified', async () => {
    const binary1 = await template({
      source,
      schema: [
        {
          image: {
            type: 'image',
            format: 'png',
            x: 0,
            y: 0,
            width: 100,
            height: 100,
          },
        },
      ],
    })({ image: png }).then((doc) => doc.save())
    const binary2 = await template({
      source,
      schema: [
        {
          image: {
            type: 'image',
            format: 'png',
            x: 0,
            y: 0,
          },
        },
      ],
    })({ image: png }).then((doc) => doc.save())
    expect(binary1.byteLength).not.toEqual(binary2.byteLength)
  })
})
