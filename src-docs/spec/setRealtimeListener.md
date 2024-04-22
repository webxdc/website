# setRealtimeListener

```js
window.webxdc.setRealtimeListener((data) => {});
```

Announce participation in realtime data sending and receiving
and return a promise that resolves when at least one peer is connected. 

The `setRealtimeListener` callback receives all `Uint8Array` data items 
that were sent from a peer through [`sendRealtimeData(data)`](./sendRealtimeData.md).

Note that sending data before the promise is resolved will discard the sent data. 

Calling `setRealtimeListener` with a `null` value will disconnect from receiving 
and sending realtime data. You may afterwards call `setRealtimeListener` again
to re-establish participation in realtime sending and receiving. 

## Example 

```js

window.webxdc.setRealtimeListener((data) => {
    console.log("Received realtime data: ", data);
    const msg = new TextDecoder().decode(data);
    console.log("decoded message: ", msg);
}).then(() => {
    const myId = window.webxdc.selfAddr;
    const data = new TextEncoder().encode('hello world from ' + myId);
    console.log("Sending message", data);
    window.webxdc.sendRealtimeData(data);
})

```
