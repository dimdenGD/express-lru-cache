import { LRUCache } from "lru-cache";

export function createCache(options = {}) {
    const lruCache = options.store || new LRUCache(options.lruCacheOptions);
    const keyGenerator = options.keyGenerator || (req => req.originalUrl);
    const enableCacheFn = options.enableCacheFn || (() => true);

    return (req, res, next) => {
        const key = keyGenerator(req, res, lruCache);
        const enableCache = enableCacheFn(req, res, lruCache);
        const cachedResponse = lruCache.get(key);

        if (enableCache && cachedResponse) {
            res.send(cachedResponse);
        } else {
            function sendResponse() {
                lruCache.set(key, res.body);
                res.end(res.body);
            }

            res.end = sendResponse;

            next();
        }
    }
}