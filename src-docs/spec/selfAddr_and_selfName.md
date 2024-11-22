# selfAddr & selfName

## selfAddr

```js
window.webxdc.selfAddr
```

`selfAddr` is a unique string within a webxdc application that

- can be used in other webxdc APIs,

- should not be shown in the user interface of the webxdc app,

- is identical across multiple invocations of the same webxdc application,

- is identical on multiple devices of the user using the same webxdc application, 

- is not guaranteed to be human-readable,

- should not have meaning outside the webxdc application. 

For example, a webxdc application can 

- send its `selfAddr` value as part of the `payload` passed into [`sendUpdate()`],

- receive such addresses through the payload of incoming updates,

- put such addresses into the `notify` parameter passed to [`sendUpdate()`] 
  to cause a user-interface notification for respective users. 


## selfName

```js
window.webxdc.selfName
```

This is the nick or display name for the webxdc user 
which can be displayed in the user interface for human recognition. 

[`sendUpdate()`]: ./sendUpdate.html
