# Express to Lambda

Simple package for converting your express application to an AWS Lambda.

![](https://github.com/cosmin220304/express-to-lambda/blob/main/demo.gif?raw=true)

## How to use it

Simply run the command as:

```js
npx express-to-lambda@latest <target folder>
```

<ins>Note</ins>: has support for both commonJs and modules!

Want to use it in your app?

```js
// modules
import { convert } from "express-to-lambda"

convert(<folder name>);
```

```js
// commonJs
const { convert } = require("express-to-lambda")

convert(<folder name>);
```

## What it does?

(1) comments the app listener  
(2) adds lambda handler to the express root

## Future plans:

⬜️ option to generate .zip file  
⬜️ option for direct upload to aws using ~/.aws/config

## Bugs & suggestions

If you found any bugs or have any suggestions open a ticket at:
https://github.com/cosmin220304/express-to-lambda/issues
