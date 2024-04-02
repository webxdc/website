# Ephemeral side channels

### WebXDC Ephemeral Channels API

The WebXDC ephemeral API has two methods `sendEphemeralUpdate<T>(payload: T)` and `setEphemeralUpdateListener<T>((payload: T) => void)` which allow one to explicitly send and receive data over an "ephemeral" channel. This data only has to be serializable by js. 

Ephemeral channels provide a fast transport layer, ideally directly between machines collaborating on the same WebXDC app, improving performance significantly. The purpose of this is application state syncing for real time games or collaborative applications. It could for example be used to sync to display the cursor of all peers in an collaborative editor. The gossip layer should be much faster than normal messages but has the downside that messages are _not_ persist like regular WebXDC messages. WebXDC application developers need to explicitly handle persistence if desired (for example by sending regular messages), but ideally only use ephemeral channels for non-critical data.

### Iroh
DeltaChat uses the ephemeral-channel provider [Iroh](https://iroh.computer/), which attempts to establish direct p2p connections between peers (QUIC), using PlumTree as a gossiping protocol for efficient peer sampling. Iroh falls back to relay nodes when a direct connection can not be established. Even a relayed connection is faster than sending single WebXDC messages via mail. 