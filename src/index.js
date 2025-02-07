import { LRUCache } from "lru-cache";

export default function createCache(options = {}) {
    const lruCache = options.store || new LRUCache(options.lruCacheOptions);
    const keyGenerator = options.keyGenerator || (req => req.originalUrl);
    const enableCacheFn = options.enableCacheFn || (() => true);

    return (req, res, next) => {
        const key = keyGenerator(req, res, lruCache);
        const enableCache = enableCacheFn(req, res, lruCache);
        const cachedResponse = lruCache.get(key);

        if (enableCache && cachedResponse) {
            const [body, contentType, statusCode] = cachedResponse;
            res.status(statusCode);
            res.set("content-type", contentType);
            res.send(body);

        } else {
            let originalEnd = res.end;
            function sendResponse() {
                lruCache.set(key, [res.body, res.get("content-type"), res.statusCode]);
                originalEnd.apply(res, arguments);

            }

            res.end = sendResponse;

            next();
        }
    }
}