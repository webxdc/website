# selfAddr & selfName

## selfName

```js
window.webxdc.selfName
```

`selfName` is the nick or display name for the user 
which can be displayed in the user interface of the webxdc application. 


## selfAddr

```js
window.webxdc.selfAddr
```

`selfAddr` is a unique string within a webxdc application that

- should not be shown in the user interface of the webxdc application,

- can be used in other webxdc APIs,

- is identical across multiple invocations of the same webxdc application,

- is identical on multiple devices of the user using the same webxdc application, 

- should not be linkable to addresses of the same user in other webxdc applications. 


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
