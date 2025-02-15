# express-lru-cache

Express middleware to cache responses using LRU cache.

## Installation

```bash
npm install express-lru-cache
```

## Usage

```js
import createLRUCache from "express-lru-cache";
import express from "express";

const app = express();

app.get("/expensive-endpoint/:userId", createLRUCache({
    lruCacheOptions: {
        max: 1000,
        ttl: 1000 * 60 * 60 * 24,
    },
    keyGenerator: (req, res, lruCache) => req.params.userId,
    enableCacheFn: (req, res, lruCache) => req.query.cache === "true"
}), (req, res) => {
    res.json({
        message: "Hello, world!",
    })
});

app.listen(3000);
```

## Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `lruCacheOptions` | `Object` | `{}` | Options for the [LRU cache](https://www.npmjs.com/package/lru-cache). |
| `keyGenerator` | `Function` | `(req, res, lruCache) => req.originalUrl` | Function to generate a key for the cache. |
| `enableCacheFn` | `Function` | `(req, res, lruCache) => true` | Function to determine if the cache should be enabled. |
| `onCacheHit` | `Function` | `(req, res, lruCache, cachedResponse) => {}` | Function to call when the cache is hit. |
| `cachedHeaders` | `Array` | `['content-type']` | Headers to cache. |
| `debug` | `Boolean` | `false` | Whether to enable debug logging. |
| `store` | `any` | `new LRUCache(lruCacheOptions)` | Store to use. It can be any store that implements the `get` and `set` methods. |


