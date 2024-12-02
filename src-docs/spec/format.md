
## Webxdc Container File Format

- a Webxdc app is a **ZIP-file** with the extension `.xdc`
- the ZIP-file MUST use the default compression methods as of RFC 1950,
  this is "Deflate" or "Store"
- the ZIP-file MUST contain at least the file `index.html`
- the ZIP-file MAY contain a `manifest.toml` and `icon.png` or
  `icon.jpg` files
- if the webxdc app is started, `index.html` MUST be opened in a [restricted webview](./messenger.md#webview-constraints-for-running-apps) that only allows accessing
  resources from the ZIP-file.

### The manifest.toml File

If the ZIP-file contains a `manifest.toml` in its root directory,
the following basic information MUST be read from it: 

```toml
name = "My App Name"
source_code_url = "https://example.org/orga/repo"
```

- `name` - The name of the webxdc app.
  If no name is set or if there is no manifest, the filename is used as the webxdc name.

- `source_code_url` - Optional URL where the source code of the webxdc and maybe other information can be found.
  Messenger implementors may make the url accessible via a "Help" menu in the webxdc window.


### Icon Files 

If the ZIP-root contains an `icon.png` or `icon.jpg`,
these files are used as the icon for the webxdc.
The icon should be a square at reasonable width/height,
usually between 128 x 128 and 512 x 512 pixel.
Round corners, circle cut out etc. will be added by the implementations as needed;
do not add borders or shapes to the icon therefore.
If no icon is set, a default icon will be used.
