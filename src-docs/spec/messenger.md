## Messenger Implementation for Webxdc Apps

This section describes requirements and guidance for messenger implementors 
to add support for their users to run and interact with webxdc apps.
Webxdc apps are attached to a chat message using the [container file](./format.md) format,
and they can be "started" on all receiving devices of the chat message. 
Each such chat message constitutes a separate "webxdc app".
The same webxdc container file shared in two separate chat messages 
will be regarded as two separate "webxdc apps" 
and the two apps can not communicate with, or even know about, each other. 

### Webview Constraints for Running Apps

When starting a web view for a webxdc app to run, messenger implementors:

- MUST run the [webxdc container file](./format.md) in a constrained, 
  network-isolated webview that 
  MUST deny all forms of internet access. 
  If you don't do this
  unsuspecting users may leak data of their private interactions to outside third parties.
  You do not need to offer "privacy" or "cookie" consent screens as
  there is no way a webxdc app can implicitly transfer user data to the internet.

- MUST allow unrestricted use of DOM storage (local storage, indexed db and co),
  but make sure it is scoped to each webxdc app so they can not delete or modify
  the data of other webxdc content.

- MUST inject `webxdc.js` and implement the
  [Webxdc Javascript API](api.md) so that messages are relayed and shown in chats.

- MUST make sure the standard JavaScript API works as described at
  [Other APIs and Tags Usage Hints](../faq/compat.md#other-apis-and-tags-usage-hints).

In ["Bringing E2E privacy to the web"](https://delta.chat/en/2023-05-22-webxdc-security) 
Delta Chat developers discuss the unique privacy guarantees of webxdc,
and which mitigations messengers using Chromium webviews need to implement to satisfy them. 

### Exposing ratelimits objects to webxdc apps 

If a messenger offers the ["ratelimits" object](ratelimits.md)
it SHOULD provide all specified properties, and not just a subset of them. 

### UI Interactions in Chats

- Text from `update.info` SHOULD be shown in the chats
  and tapping them should jump to their webxdc message

- The most recent text from `update.document` and `update.summary` SHOULD be shown inside the webxdc message,
  together with name and icon.
  Only one line of text SHOULD be shown and truncation is fine
  as webxdc devs SHOULD NOT be encouraged to send long texts here.

- A "Start" button SHOULD run the webxdc app.

### Example Messenger Implementations

- [Android using Java](https://github.com/deltachat/deltachat-android/blob/master/src/org/thoughtcrime/securesms/WebxdcActivity.java)

- [iOS using Swift](https://github.com/deltachat/deltachat-ios/blob/master/deltachat-ios/Controller/WebxdcViewController.swift)

- [Desktop using TypeScript](https://github.com/deltachat/deltachat-desktop/blob/786b7514d69ffb723bbe6e706494852a2641bfcd/src/main/deltachat/webxdc.ts)

