# sendRealtimeData()

```js
window.webxdc.sendRealtimeData(data);
```

Send `Uint8Array` data to other realtime peers for this app. 
You must first call [`setRealtimeListener`](./setRealtimeListener.md) 
and wait for the returned promise to resolve before sending. 

Any sent data is 

- **private to the chat**: Only chat members can receive realtime data. 

- **scoped to the app**: different apps in a
  chat can not discover or receive realtime data of other apps in the chat. 

- **ephemeral**: any sent data will only be received by the currently
  connected chat peers but not by peers joining later.
  There is no guarantee anyone is receiving the sent data
  because for example there might be no currently listening peers 
  or there is no network at all. 

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
```
