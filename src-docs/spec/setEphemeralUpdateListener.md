# setEphemeralUpdateListener

```js
window.webxdc.setEphemeralUpdateListener((payload) => {});
```

With `setEphemeralUpdateListener()` you define a callback that receives the _ephemeral_ updates
sent by [`sendEphemeralUpdate()`](./setEphemeralUpdateListener.md). The callback is called for updates sent _only_ by other peers.

- `payload`:

Calling `setEphemeralUpdateListener()` multiple times is undefined behavior: in current implementations the callback is simply replaced.

[`sendEphemeralUpdate()`]: ./sendEphemeralUpdate.html
