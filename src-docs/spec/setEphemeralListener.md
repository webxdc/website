# setEphemeralListener

```js
window.webxdc.setEphemeralListener((payload) => {});
```

`setEphemeralListener` can be used to set a callback that receives the _ephemeral_ messages
sent by [`sendEphemeral`](./sendEphemeral.md). Ephemeral messages are messages that are delivered only to peers that are currently connected with a direct connection to the sender. These messages are not persisted and should thus only be used for unimportant synchronization like cursor positions and live game data. Members of a chat that are not currently connected will never receive these messages.
The `setEphemeralListener` function returnes a promise that resolves as soon as at least one peer is online. The completion of the promise thus signales that the connection is usable for message delivery. Messages that are send with [`sendEphemeral`](./sendEphemeral.md) before this promise resolves are discarded and will never reach any peer.

- `payload`: Any json object deserialized by `JSON.parse`.

Calling `setEphemeralListener()` multiple times is undefined behavior: in current implementations the callback is simply replaced. 


## Example
```js
// stub implementation until the channel is ready
let sendGossip = () => { console.error("transport not ready") }

window.webxdc.setEphemeralListener(function (message) {
    console.log("Received ephemeral message: ", message);
    /* Application code */
}).then(() => {
    // Replace `sendGossip` with proper implementation
    sendGossip = () => {
        console.log("New ephemeral message: ", msg);
        window.webxdc.sendEphemeral(msg);
    }
});
```