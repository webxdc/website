# selfAddr & selfName

## selfName

```js
window.webxdc.selfName
```

`selfName` is the nick or display name for the user
which the webxdc application may show in its user interface.


## selfAddr

```js
window.webxdc.selfAddr
```

A string ("unique ID") identifying the user in the current webxdc application.
Every user of a webxdc application must get a different `selfAddr`. 
The `selfAddr` must be the same if the webxdc is started again later for the same user,
on the same or on a different device. 
The same user opening a different webxdc application, however, 
SHOULD have a different `selfAddr` to avoid linkability between apps: 
even if a web app manipulates users to share `selfAddr` values via copy+paste 
to another web app, addresses between the two web apps should not be linkable. 

Note that `selfAddr` 

- has no meaning outside the webxdc application,

- should not be shown in the user interface of the webxdc application
  (use `selfName` instead). 

## appSenderAddr

```js
window.webxdc.appSenderAddr
```

`appSenderAddr` is the address of the peer who initially shared the webxdc application in the chat.
It can be compared to `webxdc.selfAddr` to determine whether the app is running
for the sender or a receiver.
This supports a common development model where a "central" app instance
(the sender's) processes all updates and distributes the resulting state
back to all peers.

## canOnlySendUpdatesToAppSender

```js
window.webxdc.canOnlySendUpdatesToAppSender
```

`canOnlySendUpdatesToAppSender` is a boolean that is `true` if updates sent
by the local user will only be seen by the app sender.
If it is `false` or `undefined`, the local user can send [updates](./sendUpdate.md) to everyone in the chat.

On some platforms, such as "broadcast channels," it is technically impossible
for subscribers to discover or send updates to each other directly.
In those cases, only the app sender can distribute updates globally.



## Example using selfAddr and selfName

Here is a simple chat app that sends out a reply using the display names
but uses the addresses for notifications.

```js
// Receive a message from anyone in the chat
let users = new Set();

window.webxdc.setUpdateListener((update) => {
    const prompt = `${update.payload.senderName} (${update.payload.senderAddr}):`;
    users.add(update.payload.senderAddr);
    console.log(`${prompt} ${update.message}`);
});

// start some user interface which calls the following function for
// message sending

function sendMessage(text) {
    let payload = {
        senderAddr: window.webxdc.selfAddr,
        senderName: window.webxdc.selfName,
        message: text
    };

    // notify all users who ever sent a message in the chat app
    let notify = {};
    for (const addr of users) {
        notify[addr] = `new message from ${webxdc.selfName}`;
    }

    window.webxdc.sendUpdate({
        payload: payload,
        notify: notify
    });
})
```


[`sendUpdate()`]: ./sendUpdate.html
