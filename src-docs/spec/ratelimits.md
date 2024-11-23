
# ratelimits object

```js
window.webxdc.ratelimits
```

An object providing information about rate limits
of the underlying messaging layer for this webxdc app instance,
with the following properties:

- `ratelimits.sendUpdateInterval` indicates the number of seconds 
  to wait for before calling [`sendUpdate()`] again since the last call. 
  If the webxdc app calls `sendUpdate` at a higher rate 
  the messaging layer may delay the sending of updates. 

- `ratelimits.sendUpdateMaxPayload` is the number of bytes that 
  the messaging layer will accept in the "payload" of a single [`sendUpdate`] invocation.

If the messaging layer does not expose the `ratelimits` object,
or it only offers a subset of the properties,
then webxdc apps should assume the following defaults:

- `sendUpdateInterval = 10`

- `sendUpdateMaxPayload = 10000`

## Example 

A webxdc editor app sends combined changes in a single `sendUpdate` call 
at most every `sendUpdateInterval=10` seconds. 
The messaging layer will attempt to deliver each update immediately. 
But if the editor app were to call `sendUpdate` every 2 seconds instead, 
it might get rate-limited and updates get queued instead of send immediately. 
How long "too fast" updates will be delayed 
depends on the messaging layer implementation
but may go well beyond the `sendUpdateInterval` number of seconds. 

