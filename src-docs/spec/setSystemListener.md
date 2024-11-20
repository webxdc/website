# setSystemListener

```js
window.webxdc.setSystemListener((event) => {});
```

With `setSystemListener()` you define a callback that receives system events.

Each `event` which is passed to the callback comes with one of the following properties set:

- `event.click`: user clicked an info message or a notification sent by [`sendUpdate()`].
  `event.click` contains the whole update object.
  If the click was performed _before_ the app was started,
  it is guaranteed that this event is emitted before `setSystemListener()` returns.
  Note, however, that the event can be emitted also multiple times while the app is running,
  e.g. when the user taps info messages while the app is already started. 

Example:

```js
window.webxdc.setSystemListener((event) => {
    if (event.click) {
    
       // `event.click.payload` is the payload defined on `window.webxdc.sendUpdate()`
       // and can be set to contain information about what to do with the tap.
       
       // in an editor, that could open the app and show a diff.
       // in a calendar, you may want to show the corresponding date.
       
       // note, that the event can be triggered multiple times,
       // also while the app is running.
       
       console.log("info message or notification tapped");
    }
});
```  


Calling `setSystemListener()` multiple times is undefined behavior.


[`sendUpdate()`]: ./sendUpdate.html