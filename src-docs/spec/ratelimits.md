
# ratelimits object

```js
window.webxdc.ratelimits
```

An object providing information about rate limits
of the underlying messaging layer for this webxdc app instance,
with the following properties:

- `ratelimits.sendUpdateBurst` is the number of [`sendUpdate`]
  invocations allowed within `sendUpdateWindow` seconds. 
  Any `sendUpdate` calls beyond the burst rate limit will be queued 
  until the window is completed. 

- `ratelimits.sendUpdateWindow` is the number of seconds 
  or duration of the the rate-limit window. 

- `ratelimits.sendUpdateMaxPayload` is an integer denoting the maximum number of bytes
  the messaging layer will accept in the "payload" of a single [`sendUpdate`] invocation.

See [Leaky Bucket algorithm](https://en.wikipedia.org/wiki/Leaky_bucket) 
and the below example
to understand how messaging rate limiting typically works for network messaging. 

If the messaging layer does not expose the `ratelimits` object,
or it only observes a subset of the properties,
then webxdc apps should assume the following defaults:

- `sendUpdateBurst = 6`

- `sendUpdateWindow = 60`

- `sendUpdateMaxPayload = 10000`

## Example 

If using the `sendUpdateBurst=6` and `sendUpdateWindow=60` defaults, 
a webxdc app instance can expect to be able to 

- to send up to 6 update messages at once (within a single second even) 

- as soon as it tries to send a 7th update message
  it will be queued until 60 seconds are over 
  before resuming to send updates to the network. 

Consider an editor webxdc app where the user constantly changes the document 
and let's consider the default rates above. 
If the editor wants to ensure that receivers do not have random larger delays 
in receiving messages, 
it can compute a fixed-rate seconds delay with `sendUpdateWindow / sendUpdateBurst = 10`. 
The editor webxdc app could only send out combined updates every 10 seconds, 
to guarantee that receivers do not have to wait much longer than 10 seconds
to see changes to the document. 
