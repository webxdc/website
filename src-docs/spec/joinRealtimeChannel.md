# joinRealtimeChannel (experimental)

```js
const realtimeChannel = window.webxdc.joinRealtimeChannel();
```

Setup and return the realtime channel for this app,
with methods for listening and sending data as well as leaving the channel. 
Per-app realtime channels are: 

- **private**: no one outside the chat can participate in realtime channels. 

- **isolated**: apps can not participate in realtime channels of other apps. 

- **ephemeral**: any sent data will only be received by currently
  connected peers but not by peers connecting later.

Calling `joinRealtimeChannel` a second time without leaving the prior one
will throw an error.

## Check if the API is available

This API is experimental and may not be implemented by every messenger yet.
Check if it is available with `window.webxdc.joinRealtimeChannel !== undefined`
(for Delta Chat, the API is available and enabled by default since 1.48)

## `realtimeChannel.setListener((data) => {})` 

Start listening on the realtime channel using the specified callback. 
The callback receives `Uint8Array` data items that were sent from connected peers. 
Calling `setListener` a second time will replace the previous listener. 


## `realtimeChannel.send(data)` 

Send a `Uint8Array` data item to connected peers. 
There is no guarantee anyone is receiving sent data
because there might be no currently listening peers,
or network connections fail. 
It is up to the app to determine connectivity status with other peers
by monitoring and triggering data messages. 


## `realtimeChannel.leave()`

Leave the realtime channel. 
Afterwards the `realtimeChannel` is invalid and 
can not be used anymore for sending or receiving data.
You need to call `window.webxdc.joinRealtimeChannel()` again
to re-join the per-app realtime channel. 

## Example 

```js
const realtimeChannel = window.webxdc.joinRealtimeChannel();
realtimeChannel.setListener((data) => {
    console.log("Received realtime data: ", data);
    const msg = new TextDecoder().decode(data);
    console.log("decoded message: ", msg);
})

let numMsgs = 0
const refreshIntervalId = setInterval(() => {
    const myId = window.webxdc.selfAddr;
    const data = new TextEncoder().encode(`[${numMsgs}] hello from ${myId}`);
    numMsgs += 1
    console.log("Sending message", data);
    realtimeChannel.send(data);
    if (numMsgs >= 100) {
        realtimeChannel.leave();
        clearInterval(refreshIntervalId);
    }

}, 1000)
```
