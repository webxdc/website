
# ratelimits object

```js
window.webxdc.ratelimits
```

An object providing information about rate limits
of the underlying messaging layer for this webxdc app instance,
with the following properties:

- `ratelimits.sendUpdateRateLimitBurst` is an integer denoting how many
  sendUpdate messages can be maximally send within `sendMessageRateLimitWindow` seconds.

- `ratelimits.sendUpdateRateLimitWindow` is an integer denoting the number of
  seconds of the rate-limit window used for `sendUpdateRateLimitBurst`.

- `ratelimits.sendUpdateMaxSize` is an integer denoting the maximum number of bytes
  the messaging layer will accept in the "payload" of a single [`sendUpdate`] invocation.

If the messaging layer does not expose the `ratelimits` object,
or it only observes a subset of the properties,
then webxdc apps should assume the following defaults:

- `sendUpdateRateLimitBurst = 5`

- `sendUpdateRateLimitWindow = 60`

- `sendUpdateMaxSize= 10000`

