## webxdc xstore simple webinterface

Search webxdc store and download apps from a simple website.

## setup
You need to serve the export/output directory of [xdcget](https://codeberg.org/webxdc/xdcget) somewhere and point the `xdcget_export` constant in main.js to the location you hosted it at.

If you host it on a different domain or subdomain you need to enable CORS. (https://enable-cors.org) -> basically set the cors header(s).

The rest of the deployment is easy, as this repo is just the source of a static site, just serve it somewhere. No build/bundle, npm/node or whatever required. Just a static file server like the pages service many git forges provide.