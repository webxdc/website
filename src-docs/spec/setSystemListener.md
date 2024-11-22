# setSystemListener

```js
window.webxdc.setSystemListener((event) => {});
```

Set a callback that receives system events.

Calling `setSystemListener()` multiple times produces undefined behavior.

## Properties of system events

A system event object offers the following properties: 

- `event.type` indicates the event type

- Additional `event` properties are type-specific


### "click" type events 

This event is emitted when the user clicked an info message or a notification. 

A system event has the following property set: 

- `event.update`: the [`update object`] this click relates to

If the click was performed _before_ the app was started,
the click event is passed to the system listener callback
before `setSystemListener()` returns.

If the click was performed while the app was running,
it will be emitted multiple times. 

Example:

```js
window.webxdc.setSystemListener((event) => {
    if (event.type === "click" ) {
       console.log("info message or notification tapped", event.update);
    }
});
```  


[`sendUpdate()`]: ./sendUpdate.html
[`update object`]: ./setUpdateListener.html#Application-update-object
