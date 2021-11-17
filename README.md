# pdf-renderer

## Install

```sh
npm install pdf-renderer
```

## Usage

```ts
import { template } from 'pdf-renderer'

const render = template({
  source: { width: 100, height: 100 },
  schema: [
    {
      title: {
        type: 'text',
        x: 0,
        y: 0,
        width: 50,
        height: 50
      }
    }
  ]
})

const doc = await render({ title: 'Title Of PDF' })

const bytes = await doc.save()
```
