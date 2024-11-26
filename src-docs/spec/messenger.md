## Messenger Implementation for Webxdc Apps

This section describes requirements and guidance for messenger implementors 
to add support for their users to run and interact with webxdc apps.
Webxdc apps are attached to a chat message using the [container file](./format.md) format,
and they can be "started" on all receiving devices of the chat message. 
Each such chat message constitutes a separate "webxdc app".
The same webxdc container file shared in two separate chat messages 
will be regarded as two separate "webxdc apps" 
and the two apps can not communicate with, or even know about, each other. 

### Webview Constraints

When starting a web view for a webxdc app to run, messenger implementors

- MUST serve all resources from the [webxdc container file](./format.md) 
  to the webxdc application. 

- MUST implement the [Webxdc Javascript API](api.md) 
  and serve a `webxdc.js` file accordingly. 

- MUST deny all forms of Internet access;
  if you don't restrict internet access 
  unsuspecting users may run 3rd party apps
  that leak data of private interactions to outside third parties.
  See ["Bringing E2E privacy to the web"](https://delta.chat/en/2023-05-22-webxdc-security)
  which contains a deep discussion of the unique privacy guarantees of webxdc. 

- MUST support `localStorage`, `sessionStorage` and `indexedDB`

- MUST isolate all storage and state of one webxdc app from any other 

- MUST support `visibilitychange` events

- MUST support `window.navigator.language`

- MUST support `window.location.href` but you can not specify or assume anything
  about the scheme or domain part of the url.

- MUST support HTML links such as `<a href="localfile.html">`

- MUST support `mailto` links, such as `<a href="mailto:addr@example.org?body=...">`

- MUST support `<meta name="viewport" ...>` is useful especially as webviews from different platforms have different defaults

- MUST support `<input type="file">` to allow importing of files;
  see [`sendToChat()`](../spec/sendToChat.md) for a way to export files. 


### UI Interactions in Chats

- Text from `update.info` SHOULD be shown in the chats
  and tapping them SHOULD open the webxdc app directly.
  If `update.href` was set then the webxdc app MUST
  be started with the root URL for the webview with
  the value of `update.href` appended.

- The most recent text from `update.document`
  and `update.summary` SHOULD be shown inside the webxdc message,
  together with name and icon.
  Only one line of text SHOULD be shown and truncation is fine
  as webxdc application developers SHOULD NOT be encouraged to send long texts here.

- A "Start" button MUST be offered that runs the webxdc app.
  Note that there is no need to ask for "privacy" or "cookie" consent because 
  there is no way a webxdc app can implicitly transfer user data to the internet.


### Example Messenger Implementations

- [Delta Chat Android using Java](https://github.com/deltachat/deltachat-android/blob/master/src/org/thoughtcrime/securesms/WebxdcActivity.java)

- [Delta Chat iOS using Swift](https://github.com/deltachat/deltachat-ios/blob/master/deltachat-ios/Controller/WebxdcViewController.swift)

- [Delta Chat Desktop using TypeScript](https://github.com/deltachat/deltachat-desktop/blob/786b7514d69ffb723bbe6e706494852a2641bfcd/src/main/deltachat/webxdc.ts)

