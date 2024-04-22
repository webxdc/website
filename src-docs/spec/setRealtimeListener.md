# setRealtimeListener

```js
window.webxdc.setRealtimeListener((data) => {});
```

**Note that this API is experimental and not fully settled (April 2024)**

Register a listener callback for realtime data arriving from other peers. 
This will implicitely trigger the setup of realtime connections
if they were not established yet. 
The `setRealtimeListener` callback receives `Uint8Array` data items 
that were sent from connected peers. 
See [`sendRealtimeData(data)`](./sendRealtimeData.md) for more info. 

Calling `setRealtimeListener` with a `null` value 
will disconnect from receiving and sending realtime data. 
You may afterwards call `setRealtimeListener` again with a callback
to re-establish participation in realtime sending and receiving. 

## Example 

```js
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
