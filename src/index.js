import { LRUCache } from "lru-cache";

export default function createCache(options = {}) {
    const lruCache = options.store || new LRUCache(options.lruCacheOptions);
    const keyGenerator = options.keyGenerator || (req => req.originalUrl);
    const enableCacheFn = options.enableCacheFn || (() => true);
    const cachedHeaders = options.cachedHeaders || ['content-type'];

    function debug(...args) {
        if (options.debug) {
            console.log(...args);
        }
    }


    return (req, res, next) => {
        const key = keyGenerator(req, res, lruCache);
        const enableCache = enableCacheFn(req, res, lruCache);
        const cachedResponse = lruCache.get(key);
        debug("Cache key", key, enableCache);

        if (enableCache && cachedResponse) {
            const [body, headers, statusCode] = cachedResponse;
            debug("Cache hit for", key, cachedResponse);
            
            res.status(statusCode);
            headers.forEach((header) => {
                res.set(header[0], header[1]);
            });
            if(options.onCacheHit) {
                options.onCacheHit(req, res, lruCache, cachedResponse);
            }
            res.send(body);
        } else {
            let originalEnd = res.end;
            function sendResponse(body) {
                const response = [body, cachedHeaders.map(header => [header, res.get(header)]), res.statusCode];
                lruCache.set(key, response);
                debug("Saved response to cache", key, response);
                originalEnd.apply(res, arguments);
            }


            res.end = sendResponse;

            next();
        }
    }
}