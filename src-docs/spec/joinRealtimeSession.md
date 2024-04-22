# joinRealtimeSession()

```js
window.webxdc.joinRealtimeSession();
```

*NOTE: (April 2024) this API is experimental and subject to change without further notice*

Return a `realtimeSession` object that allows to send and receive data 
using direct connections with other joining chat peers. 
Calling `joinRealtimeSession()` a second time returns the same singleton object. 
Realtime sessions are 

- **private to the chat**: Only chat members can connect. 

- **scoped to the app from which they are started**: different apps in a
  chat can not discover, listen to, or interfere with realtime sessions 
  of other apps in the same chat. 

- **ephemeral**: any sent data will only be received by the currently
  connected chat peers but not by peers joining later.


## `realtimeSession.on(event, callback)`

Register an event handler callback for a realtimeSession event. 
Currently supported event types are:

- `ready`: fired once if at least one realtime peer is connected. 

- `data`: fired on receiving a `Uint8Array` that was sent from a realtime peer. 
  The callback will only receive `data` that arrived after its registration. 

## `realtimeSession.sendToConnectedPeers(data)`

Send a `Unit8Array` data item to all connected peers. 


## Example

```js

const realtimeSession = window.webxdc.joinRealtimeSession();

realtimeSession.on("ready", () => {
    const myId = window.webxdc.selfAddr;
    const data = new TextEncoder().encode('hello world from ' + myId);
    console.log("Sending message", data);
    realtimeSession.sendToConnectedPeers(data);
})

realtimeSession.on("data", (data) => {
    console.log("Received realtime data: ", data);
    const msg = new TextDecoder().decode(data);
    console.log("decoded message: ", msg);
})
```
