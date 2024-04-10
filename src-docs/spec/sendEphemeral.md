# sendEphemeral

```js
window.webxdc.sendEphemeral(payload);
```

Send an ephemeral message to all peers. [setEphemeralListener](./setEphemeralListener.md) has to be called first to create a connection to at least on peer. See the documentation for [setEphemeralListener](./setEphemeralListener.md) to find out more.

- `payload` any javascript object that can be given to `JSON.stringify`
