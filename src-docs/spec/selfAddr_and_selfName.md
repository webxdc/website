# selfAddr & selfName

## selfAddr

```js
window.webxdc.selfAddr
```

A unique string for addressing the user of a running webxdc application. 
The address must be 

- identical across multiple invocations of the same webxdc application,

- identical on multiple devices, 

- must be distinct from all other user's addresses for the webxdc application. 

The address should not be shown in the user interface of the webxdc app
except for debugging purposes because it is not guaranteed to be human-readable,
may be long, and may not have any meaning outside the context of the webxdc application. 

A webxdc application can 

- send its `selfAddr` value around in the payload passed to [`sendUpdate()`] and 

- receive such addresses through the payload of incoming updates,

- put such addresses into the `notify` parameter passed to [`sendUpdate()`] 
  to cause a user-interface notification for the users behind the addresses. 


## selfName

```js
window.webxdc.selfName
```

This is the nick or display name for the webxdc user 
which is intended for showing it in the user interface. 

[`sendUpdate()`]: ./sendUpdate.html
