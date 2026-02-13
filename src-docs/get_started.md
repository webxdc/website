# Getting Started 

Webxdc brings mini apps to messenger chats.
Users share and run mini apps, while developers create them using the webxdc format and API.

Mini apps are packaged in a simple file format containing HTML5, CSS, JavaScript and other asset files. 
All authentication, identity management, social discovery and message transport 
is outsourced to the host messenger which runs a webxdc app container file
and relays application update messages between app users,
letting each mini app inherit offline-first and end-to-end encryption 
capabilities implemented by the hosting messenger. 
Mini apps have no internet access and run in a sandboxed web view,
which means they can never track users or leak data to third parties. 

<video controls style="width:560px; max-width: 100%;"><source src="https://webxdc.org/assets/just-web-apps.mp4" type="video/mp4"><a href="https://www.youtube.com/watch?v=I1K4pBvb2pI">watch "just web apps" on youtube</a></video>

## A simple example

The e-mail based [Delta Chat](https://delta.chat) 
and the XMPP-based [Cheogram](https://cheogram.com) messengers 
support mini apps built with the [webxdc format](https://webxdc.org/apps), which run on both messengers without any change. 

The following `index.html` shows a complete mini app using the webxdc API, with an input field shown on all peers. Data submitted from the input is delivered to all members of the chat.

```html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8"/>
    <script src="webxdc.js"></script>
  </head>
  <body>
    <input id="input" type="text"/>
    <a href="" onclick="sendMsg(); return false;">Send</a>
    <p id="output"></p>
    <script>
      function sendMsg() {
        msg = document.getElementById("input").value;
        window.webxdc.sendUpdate({payload: msg}, 'Someone typed "'+msg+'".');
      }
    
      function receiveUpdate(update) {
        document.getElementById('output').innerHTML += update.payload + "<br>";
      }
      window.webxdc.setUpdateListener(receiveUpdate, 0);
    </script>
  </body>
</html>
```

To package the app as a `.xdc` file, zip the directory containing `index.html` and any related files:

```shell
(cd PATH_TO_DIR && zip -9 --recurse-paths - *) > myapp.xdc
```

Now it's possible to share the `myapp.xdc` file in any chat: recipients can hit "Start" to begin using the mini app to enter text in this input field and send updates to each other. 

To simulate multiple chat participants in the browser, try [Hello](https://github.com/webxdc/hello) as a minimal example; it includes everything needed to run the app and requires no build systems.

The [webxdc-dev simulation tool](https://github.com/webxdc/webxdc-dev) is the recommended 
tool for developing mini apps as it allows multi-user simulation, 
and allows observing network messages between app instances. 
However, no messenger is required to develop a mini app with the `webxdc-dev` tool. 

## More examples 

[webxdc on Codeberg](https://codeberg.org/webxdc) and [webxdc on GitHub](https://github.com/webxdc) 
contain curated mini app examples. 

The [webxdc store](https://webxdc.org/apps) contains working mini apps that you can use today. 
Each app comes with a "source code" link so that you can learn and fork as you wish. 
You can [submit your own available FOSS app](https://codeberg.org/webxdc/xdcget/src/branch/main/SUBMIT.md) for inclusion into the curated store. 

## Useful background for developing mini apps 

Mini app development and deployment is fundamentally easier than 
developing for and maintaining an application-specific always-online HTTP server. 
But there are undeniably complications in arranging consistent web app state 
across user's devices, a typical issue for any Peer-to-Peer (P2P) networking system. 
Even if you don't study the topic in depth, reading [Shared web application state](./shared_state/)
introduces you to the terminology and some necessary considerations,
with a particular eye on the webxdc format and providing practical guidance. 


## Participating in developments 

- [Support Forum](https://support.delta.chat/c/webxdc/20): the webxdc category on the DeltaChat forum is a space to ask questions and announce your app projects. Log into the [forum](https://support.delta.chat) via DeltaChat, Github, or by creating a username and password there.

- If you have any question about Webxdc support in the XMPP-based Cheogram messenger, head over
  to the [Cheogram forum channel](https://anonymous.cheogram.com/discuss@conference.soprani.ca)

- Announcements: Delta Chat and Webxdc-related developments can be
  followed on [Fediverse](https://chaos.social/@delta)
