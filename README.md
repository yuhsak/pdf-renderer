# pdf-renderer

## Install

```sh
npm install pdf-renderer
```

## Usage

### Create Document

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

### Existing PDF as source

```ts
import { template } from 'pdf-renderer'
import fs from 'fs'

const existingPdfBytes = fs.readFileSync('base.pdf')

const render = template({
  source: existingPdfBytes,
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
