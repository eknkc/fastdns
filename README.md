# fastdns

## install

```shell
npm install fastdns
```

## use

`fastdns` patches the native `dns` module and provides a lru cache on all responses for 5 minutes.
You need to require the module, and use the dns module as usual. All native modules and libraries should have the caching applied to them.

```js
require('fastdns');
```
