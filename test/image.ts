import { template } from '../src'
import fs from 'fs'

const source = { width: 100, height: 100 }
const empty = template({ source, schema: [] })({})
  .then((doc) => doc.save())
  .then((bin) => [...bin])
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
            x: 0,
            y: 0,
            width: 100,
            height: 100,
          },
        },
      ],
    })([{ image: png }]).then((docs) =>
      Promise.all(docs.map((doc) => doc.save().then((bin) => [...bin]))),
    )

    expect(binary).not.toEqual(emptyBinary)
  })

  test('renders jpg', async () => {
    const emptyBinary = await empty
    const [binary] = await template({
      source,
      schema: [
        {
          image: {
            type: 'image',
            x: 0,
            y: 0,
            width: 100,
            height: 100,
          },
        },
      ],
    })([{ image: jpg }]).then((docs) =>
      Promise.all(docs.map((doc) => doc.save().then((bin) => [...bin]))),
    )
    expect(binary).not.toEqual(emptyBinary)
  })

  test('skip if input value is boolean', async () => {
    const [binary1, binary2, binary3] = await template({
      source,
      schema: [
        {
          image: {
            type: 'image',
            x: 0,
            y: 0,
            width: 100,
            height: 100,
          },
        },
      ],
    })([{ image: false }, { image: true }, { image: png }]).then((docs) =>
      Promise.all(docs.map((doc) => doc.save().then((bin) => [...bin]))),
    )
    expect(binary1).toEqual(binary2)
    expect(binary1).not.toEqual(binary3)
    expect(binary2).not.toEqual(binary3)
  })

  test('use raw height when width and height both are not specified', async () => {
    const binary1 = await template({
      source,
      schema: [
        {
          image: {
            type: 'image',
            x: 0,
            y: 0,
            width: 100,
            height: 100,
          },
        },
      ],
    })({ image: png }).then((doc) => doc.save().then((bin) => [...bin]))
    const binary2 = await template({
      source,
      schema: [
        {
          image: {
            type: 'image',
            x: 0,
            y: 0,
          },
        },
      ],
    })({ image: png }).then((doc) => doc.save().then((bin) => [...bin]))
    expect(binary1).not.toEqual(binary2)
  })
})
