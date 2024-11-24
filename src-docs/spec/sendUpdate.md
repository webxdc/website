# sendUpdate

```js
window.webxdc.sendUpdate(update);
```

Send an update to all peers.

- `update`: an object with the following properties:  
    - `update.payload`: string, number, boolean, array, object or `null`.
       MUST NOT be `undefined`.
       Everything that is not JSON serializable will be skipped,
       this especially affects Binary data buffers as used in `File`, `Blob`, `Int*Array` etc.;
       if needed, use eg. base64.
    - `update.info`: optional, short, informational message that will be added to the chat,
       e.g. "Alice voted" or "Bob scored 123 in MyGame".
       Do not add linebreaks; implementations will truncate the text at about 50 characters or less.
       If there are series of info messages, older ones may be dropped.
       use this option sparingly to not spam the chat.
    - `update.document`: optional, name of the document in edit
       (eg. the title of a poll or the name of a text in an editor)
       Implementations show the document name e.g. beside the app icon or in the title bar.
       MUST NOT be used if the webxdc does not create documents, e.g. in games.
       Do not add linebreaks; implementations will truncate the text at about 20 characters or less.
    - `update.summary`: optional, short text, shown beside the app icon;
       it is recommended to use some aggregated value, e.g. "8 votes", "Highscore: 123".
       Do not add linebreaks; implementations will truncate the text at about 20 characters or less.

All peers, including the sending one,
will receive the update by the callback given to [`setUpdateListener()`](./setUpdateListener.html).

There are situations where the user cannot send messages to a chat,
e.g. if the webxdc instance comes as a contact request or if the user has left a group.
In these cases, you can still call `sendUpdate()`,
however, the update won't be sent to other peers
and you won't get the update by [`setUpdateListener()`](./setUpdateListener.html).


## Messaging layer limits for sendUpdate 

A messaging layer SHOULD expose the following limits to web applications: 

- `webxdc.sendUpdateInterval` indicates the number of milliseconds 
  to wait for before calling `sendUpdate()` again since the last call. 
  If the webxdc app calls `sendUpdate` earlier than the specified interval 
  the messaging layer may delay updates for much longer
  than the interval. 

- `webxdc.sendUpdateMaxSize` is the maximum number of bytes that 
  the messaging layer will accept for a serialized `update` object
  passed into a `sendUpdate` invocation.

If the messaging layer does not expose these limits
then webxdc apps should assume the following defaults:

- `sendUpdateInterval = 10000`

- `sendUpdateMaxSize = 128000`

### Examples for using sendUpdate limits 

If using the default limits, 
a webxdc editor app could send combined changes in a single `sendUpdate` call 
at most every 10 seconds
so that the messaging layer will attempt to send each update immediately. 
If the editor app were to call `sendUpdate` every 2 seconds instead,
updates might get queued for a longer time than just the `sendUpdateInterval`. 

Moreover, an editor can also inspect `sendUpdateMaxSize` 
and send oversized updates in smaller chunks 
and recombine them on the receiving side. 

