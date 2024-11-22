# selfAddr & selfName

## selfName

```js
window.webxdc.selfName
```

This is the nick or display name for the webxdc user 
which can be displayed in the user interface for human recognition. 


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

## Example using selfAddr and selfName

Here is a simple chat app that sends out a reply using the display names
but uses the addresses for notifications. 

```js

setUpdateListener((update) => {
    sendUpdate({
        payload: {
            senderAddr: webxdc.selfAddr,
            senderName: webxdc.selfName,
        },
        info: "hello ${update.senderName} from ${webxdc.selfName}}",
        notify: [update.senderAddr]
    })
})
```


[`sendUpdate()`]: ./sendUpdate.html
