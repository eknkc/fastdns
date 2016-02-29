import dns from "dns"
import clone from "clone"
import lru from "lru-cache"

const cache = lru({
  max: 1000,
  maxAge: 1000 * 60 * 5
});

const functions = [
  "lookup",
  "lookupService",
  "resolve",
  "resolve4",
  "resolve6",
  "resolveCname",
  "resolveMx",
  "resolveNs",
  "resolveSoa",
  "resolveSrv",
  "resolveTxt",
  "reverse"
]

const originals = {};

functions.map(f => originals[f] = dns[f].bind(dns))

functions.forEach(function(name) {
  dns[name] = function(...args) {
    if (!args.length || typeof args[args.length - 1] !== 'function')
      return originals[name](...args);

    let callback = args.pop();
    let key = name + "$" + cacheKey(args);
    let cached = cache.get(key);

    if (cached) {
      return callback(null, ...clone(cached));
    }

    originals[name](...args, function(err, ...result) {
      if (err) return callback(err);
      cache.set(key, result);
      callback(null, ...clone(result));
    });
  };
})

function cacheKey(obj) {
  let type = typeof obj;

  if (type === 'string' || type === 'number' || type === 'boolean')
    return obj;
  else if (Array.isArray(obj))
    return obj.map(cacheKey).join(":");
  else if (typeof obj === 'object') {
    let keys = Object.keys(obj).sort();
    return keys.map(k => `${k}=${cacheKey(obj[k])}`).join(';')
  } else {
    return String(obj);
  }
}

module.exports = dns;
