# setRealtimeListener

```js
window.webxdc.setRealtimeListener((data) => {});
```

Announce participation in realtime data sending and receiving to other peers.

The `setRealtimeListener` callback receives all `Uint8Array` data items 
that were sent from a peer through [`sendRealtimeData(data)`](./sendRealtimeData.md).

Calling `setRealtimeListener` with a `null` value will disconnect from receiving 
and sending realtime data. You may afterwards call `setRealtimeListener` again
to re-establish participation in realtime sending and receiving. 

## Example 

```js
let timeout
window.webxdc.setRealtimeListener((data) => {
    console.log("Received realtime data: ", data);
    const msg = new TextDecoder().decode(data);
    console.log("decoded message: ", msg);
})

let pings = 0
setInterval(() => {
    const myId = window.webxdc.selfAddr;
    const data = new TextEncoder().encode(`[${pings}] hello from ${myId}`);
    pings += 1
    console.log("Sending message", data);
    window.webxdc.sendRealtimeData(data);
}, 1000)
```
