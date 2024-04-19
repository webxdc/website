# joinRealtimeSession

```js
window.webxdc.joinRealtimeSession();
```

Announce availability and participation in realtime messaging to chat peers 
and return a promise that resolves to a `realtimeSession` object 
once the announcement was sent out. 

The `realtimeSession` object provides the following methods: 

**`realtimeSession.on(event, callback)`**

Register an event handler callback for a realtimeSession event. 
Current supported event types are:

- `ready`: indicating there is at least one connected chat peer 

- `data`: indicating receiving of a `Uint8Array` sent from a peer 


**`realtimeSession.sendToConnectedPeers(data)`**

Send a `Unit8Array` data item to all connected peers. 

## Example

```js

const realtimeSession = await window.webxdc.joinRealtimeMessaging();

realtimeSession.on("ready", () => {
    const myId = window.webxdc.selfAddr;
    const data = new TextEncoder().encode('hello world from ' + myId);
    console.log("Sending message", data);
    realtimeSession.sendToConnectedPeers(data);
})

realtimeSession.on("data", (data) => {
    console.log("Received realtime data: ", data);
    msg = new TextDecoder().decode(data);
    console.log("decoded message: ", msg);
})
```
