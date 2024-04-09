# setEphemeralUpdateListener

```js
window.webxdc.setEphemeralUpdateListener((payload) => {});
```

With `setEphemeralUpdateListener()` you define a callback that receives the _ephemeral_ updates
sent by [`sendEphemeralUpdate()`](./setEphemeralUpdateListener.md). The callback is _only_ called for updates sent by other peers.
The returned promise resolves as soon as at least one peer connection is established, making the swarm operational. Sending updates before this will not result in a hard error, but these messages will never arrive anywhere.

- `payload`:

Calling `setEphemeralUpdateListener()` multiple times is undefined behavior: in current implementations the callback is simply replaced.

[`sendEphemeralUpdate()`]: ./sendEphemeralUpdate.html
