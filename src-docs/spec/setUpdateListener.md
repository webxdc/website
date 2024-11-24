# setUpdateListener

```js
let promise = window.webxdc.setUpdateListener((update) => {}, serial);
```

With `setUpdateListener()` you define a callback that receives the updates
sent by [`sendUpdate()`]. The callback is called for updates sent by you or other peers.
The `serial` specifies the last serial that you know about (defaults to 0). 
The returned promise resolves when the listener has processed all the update messages known at the time when  `setUpdateListener` was called. 

Each `update` which is passed to the callback comes with the following properties: 

- `update.payload`: equals the payload given to [`sendUpdate()`]

- `update.serial`: the serial number of this update.
  Serials are larger `0` and newer serials have higher numbers.
  There may be gaps in the serials
  and it is not guaranteed that the next serial is exactly incremented by one.

- `update.max_serial`: the maximum serial currently known.
  If `max_serial` equals `serial` this update is the last update (until new network messages arrive).

- `update.info`: optional, short, informational message (see [`sendUpdate()`])

- `update.document`: optional, document name as set by the sender, (see [`sendUpdate()`]).
  Implementations show the document name e.g. beside the app icon or in the title bar.
  There is no need for the receiver to further process this information.

- `update.summary`: optional, short text, shown beside icon (see [`sendUpdate()`])

Example:

```js
let myDocumentState = "";
const initialPendingUpdatesHandledPromise = window.webxdc.setUpdateListener(
  (update) => {
    // Remember that the listener is invoked for
    // your own `window.webxdc.sendUpdate()` calls as well!

    // Dummy document update logic.
    // Yours might be more complex,
    // such as applying a chess move to the board.
    myDocumentState = myDocumentUpdate;

    const areAllUpdatesProcessed = update.serial === update.max_serial;
    if (areAllUpdatesProcessed) {
      renderDocument();
    }
  }
);

initialPendingUpdatesHandledPromise.then(() => {
  renderDocument();
});

// Let's only call this when there are no pending updates.
function renderDocument() {
  document.body.innerText = myDocumentState;
}

// Peers can send  messages like this
window.webxdc.sendUpdate({ payload: "Knight d3" }, "Bob made a move!");
```

Calling `setUpdateListener()` multiple times is undefined behavior: in current implementations only the last invocation works.

[`sendUpdate()`]: ./sendUpdate.html
