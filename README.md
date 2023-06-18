# Express to Lambda

Simple package for converting your express application to an AWS Lambda.

## Installation:

```js
npm i express-to-lambda@latest
```

## How to use it:

### Modules

```js
import { adapter } from "express-to-lambda"

const app = express()

[...]

// app.listen(PORT)
export const handler = adapter(app)
```

### Common JS

```js
// commonJs
const { adapter } = require("express-to-lambda")

const app = express()

[...]

// app.listen(PORT)
exports.handler = adapter(app)
```

## Bugs & suggestions

If you found any bugs or have any suggestions open a ticket at:
https://github.com/cosmin220304/express-to-lambda/issues
