# sendRealtimeMessage

```js
window.webxdc.sendRealtimeDataToConnectedPeers(data);
```

Send realtime data to all connected peers. 
Note that you must first call [joinRealtimeMessaging](./setRealtimeListener.md) once
and wait for the returned promise to resolve which indicates a first connected peer
who can receive a realtime data message. 

- `data` is an `Uint8Array`

- Any peer that is not connected at the time of calling `sendRealtimeDataToConnectedPeers`
  will not receive the realtime data payload. 

- If you want to send data that reaches all chat peers independent of
  their connection status, use [`sendUpdate`](./sendUpdate.md). 
  Realtime messages are not persisted or retried and maybe dropped
  if the connection is lost. 
