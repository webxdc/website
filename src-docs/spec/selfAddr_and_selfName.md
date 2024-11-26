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

// Receive a message from anyone in the chat 
let users = new Set();

setUpdateListener((update) => {
    const prompt = "${update.payload.senderName} (${update.payload.senderAddr}):";
    users.add(update.payload.senderAddr);
    console.log("${prompt} update.message");
})

// start some user interface which calls the following function for
// message sending 

sendMessage(text) => {

    let payload = {
        senderAddr: webxdc.selfAddr,
        senderName: webxdc.selfName,
        message: text
    };

    // notify all users who ever sent a message in the chat app 
    let notify = {};
    for (var addr of users) {
        notify[addr] = "new message from ${webxdc.selfName}";
    }

    sendUpdate({
        payload: payload, 
        notify: notify
    })
})
```


[`sendUpdate()`]: ./sendUpdate.html
