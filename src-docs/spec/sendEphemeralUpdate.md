# sendEphemeralUpdate

```js
window.webxdc.sendUpdate(payload);
```

Send an ephemeral update to all peers. [setEphemeralUpdateListener](./setEphemeralUpdateListener.md) has to be called first in order to join the gossip swarm and make it operational.

- `payload` any js object that can be given to `JSON.stringify`
