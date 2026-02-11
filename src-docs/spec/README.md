# Webxdc Specification

The webxdc specification defines how mini apps are packaged, delivered, and run.
Mini apps are what users interact with, while webxdc is the technical format and API that enables them.

The specification covers three areas: 

- [`.xdc` container file format](format.md) describes the zip-file format
  with manifest and icon files for packaging mini apps. 

- [Javascript API](api.md) specifies a minimal stable API that all mini apps
  can use. 

- [Messenger implementation](messenger.md) specifies how messengers 
  run mini apps in isolated web views. 
