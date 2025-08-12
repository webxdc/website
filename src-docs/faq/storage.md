# Questions about storing application state

## Can I use localStorage or IndexedDB in my webxdc app? 

Yes, you can use both [localStorage](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage)
and [IndexedDB](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API) in your app
but be aware of some limitations, [especially during webxdc app simulation/development](#simdb). <!-- XXX this link was already broken on the master branch, but maybe we can figure out what it was supposed to point to? -->

LocalStorage [has a limit of 4-10MB](https://stackoverflow.com/questions/2989284/what-is-the-max-size-of-localstorage-values/) which you can fill up quickly if not careful. 
IndexedDB is an alternative you can use that doesn't have this size limitation. 

Note that browsers might reclaim storage for both localStorage and IndexedDB
after a longer time of not using a webxdc app. 
If you want to safely persist data, 
you must [send an application update](../spec/sendUpdate.html)
which will be safely persisted by the messenger,
and which also allows to use an app on multiple devices. 

## Why doesn't localStorage/IndexedDB work with some development simulators? {simdb}

When you run your webxdc app with the [hello simulator](https://github.com/webxdc/hello)
then all browser tabs share the same localStorage or indexedDB instance
which is unlike when your webxdc app will be run by messengers. 
However, the [webxdc-dev simulator](https://github.com/webxdc/webxdc-dev) 
manages to separate storage per webxdc app instance
because each running app uses a separate localhost port for connecting
to the webxdc-dev simulator server. 

## Are application updates guaranteed to be delivered to chat peers? 

No, there is no guaranteed message delivery and also 
no feedback on delivery status.
There is only a "best effort" approach. 
Messengers will typically queue messages and attempt delivery repeatedly. 

Applications should assume that updates
may be reordered and some updates may be lost.

For small documents, like a shopping list,
it is appropriate to send the whole
document state as an update each time
and merge incoming documents on reception.
This way changes can only be lost
if original sender fails to deliver
update to anyone else in the chat
and stops using the app.

For documents consisting of independent parts,
like spreadsheet consisting of cells,
similar approach can be applied
independently to each part.

For some applications
like games updating the scoreboard
it is fine to send new high scores
as individual update,
because if some update is lost
it is not critical.

If you have complex documents and have
to optimize for the size of updates
by encoding the difference between the document states,
you have to implement a synchronization protocol yourself.
As with all "network synchronization" topics there are some theoretical limits. 
In particular it is useful to study and think about 
the [Two-Generals problem](https://en.wikipedia.org/wiki/Two_Generals'_Problem) 
and learn about existing "reliability layer" protocols 
before attempting to implement one yourself.
