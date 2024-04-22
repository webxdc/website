# sendRealtimeData()

```js
window.webxdc.sendRealtimeData(data);
```

**Note that this API is experimental and not fully settled (April 2024)**

Send `Uint8Array` data to other realtime peers for this app. 
You must first call [`setRealtimeListener`](./setRealtimeListener.md) 
to announce participation in realtime data transmission. 
Note that any data sent before a first peer is connected might not arrive. 
It is up to the app to implement a "synchronization" protocol
so that peers can detect each other presences. 

Any sent data is 

- **private to the chat**: Only chat members can receive realtime data. 

- **scoped to the app**: different apps in a
  chat can not discover or receive realtime data of other apps in the chat. 

- **ephemeral**: any sent data will only be received by the currently
  connected chat peers but not by peers joining later.
  There is no guarantee anyone is receiving the sent data
  because there might be no currently listening peers,
  or network connections broke. 

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
```
