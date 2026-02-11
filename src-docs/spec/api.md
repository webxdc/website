
## Webxdc Javascript API

The webxdc API enables building mini apps that are shared in a chat. Each device runs its own instance on the recipients device when they click "Start". The mini apps are network-isolated but can share state via [`sendUpdate()`](./sendUpdate.md) and [`setUpdateListener()`](./setUpdateListener.md).

Messenger implementations expose the API through a `webxdc.js` module. To activate the webxdc API you need to use a script reference for `webxdc.js` in your HTML5 app:

```html
<script src="webxdc.js"></script>
```

`webxdc.js` must not be added to your `.xdc` file as they are provided by the messenger. To simulate webxdc in a browser, 
you may use the `webxdc.js` file from [Hello](https://github.com/webxdc/hello),
or use the [webxdc-dev tool](https://github.com/webxdc/webxdc-dev) which
both allow to simulate and debug mini apps without any messenger.
