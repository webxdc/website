
# TypeScript support

When you develop a webxdc app, you use the webxdc API to communicate with other instances of the same webxdc application.

The API is available on `window.webxdc`.

When you develop your webxdc app in TypeScript, it's handy to have proper types for this API.

## Reasons for using typescript:

- Better autocomplete in your IDE (JS and TS)
- See documentation on hover in your IDE (JS and TS)
- Support for typescript type-checking, which is very helpful in preventing bugs in larger codebases


## How to get autocompletion in your IDE via TypeScript? 

Install the [@webxdc/types node package](https://www.npmjs.com/package/@webxdc/types) via `npm`
and follow [the instructions in its README](https://github.com/webxdc/webxdc-types).

