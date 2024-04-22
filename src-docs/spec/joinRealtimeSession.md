# joinRealtimeSession (experimental API as of April 2024) 

```js
const realtimeSession = window.webxdc.joinRealtimeSession((data) => {});
```

Join an app-specific realtime session with chat peers and 
return a `realtimeSession` object with `send` and `leave` methods. 

The callback receives `Uint8Array` data items that were sent from connected peers. 

Calling `joinRealtimeSession` while another `realtimeSession` is active
will not cause any action and returns a `null` value. 

Any transmitted realtime data is 

- **private to the chat**: Only chat members can receive realtime data
  and data can only be sent to connected chat members. 

- **scoped to the app**: different apps in a
  chat can not discover or receive realtime data of other apps in the chat. 

- **ephemeral**: any sent data will only be received by the currently
  connected chat peers but not by peers joining later.

## `realtimeSession.send(data)` 

Send a `Uint8Array` data item to connected peers. 
There is no guarantee anyone is receiving sent data
because there might be no currently listening peers,
or network connections fail. 
It is up to the app to determine connectivity status with other peers. 

## `realtimeSession.leave()`

Leave the realtime session and disconnect from all peers.
Afterwards the `realtimeSession` is invalid and 
can not be used anymore for sending or receiving data.
You need to call `window.webxdc.joinRealtimeSession()` 
to re-initiate real time connectivity. 

## Example 

```js
const realtimeSession = window.webxdc.joinRealtimeSession((data) => {
    console.log("Received realtime data: ", data);
    const msg = new TextDecoder().decode(data);
    console.log("decoded message: ", msg);
})

let pings = 0
const refreshIntervalId = setInterval(() => {
    const myId = window.webxdc.selfAddr;
    const data = new TextEncoder().encode(`[${pings}] hello from ${myId}`);
    pings += 1
    console.log("Sending message", data);
    realtimeSession.send(data);
    if (pings >= 100) {
        realtimeSession.leave();
        clearInterval(refreshIntervalId);
    }

}, 1000)
```
