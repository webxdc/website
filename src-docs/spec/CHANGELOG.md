# Changelog

## [1.2] - 2024-12-15

### New APIs

- modify `webxdc.selfAddr` to return a per-app identifier 
  that can be used for the new "notify" list 

- add new `update.notify` attribute to allow causing 
  a user-visible system notification to raise awareness
  that something in an app changed 

- add new `update.href` attribute so that clicking info messages
  will provide a "deep link" into an app to ease navigation

- add new `webxdc.sendUpdateMaxInterval` and `webxdc.sendUpdateMaxSize`
  rate limits which helps apps to adapt to transport characteristics/limitations


### Deprecations

- `webxdc.sendUpdate` does not take a "descr" argument anymore. 


### Other changes 

- shifted "supported" DOM/Javascript features from the FAQ 
  into the messenger spec section 

- improved wording in several places 
