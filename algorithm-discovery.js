// Discover what algorithms are supported by the different methods, using IETF JOSE JWA, see: http://tools.ietf.org/html/draft-ietf-jose-json-web-algorithms-02

// ** Block Encryption **

window.crypto.sym.algorithms.blockenc;
// returns array of strings: ["A128CBC", "A256CBC", "A128GCM","A256GCM"]

// ** Bulk Encryption **

window.crypto.pk.algorithms.bulkenc;
// returns array of strings: ["A128CBC", "A256CBC", "A128GCM","A256GCM"]

// ** Key Agreement / Encryption **

window.crypto.pk.algorithms.keyenc;
// returns array of strings: ["RSA1_5", "RSA-OAEP", "ECDH-ES", "A128KW", "A256KW"]

// ** Signature algorithms **

window.crypto.sign.algorithms;
// returns array of strings: ["RS256", "RS384", "RS512", "ES256", "ES384", "ES512"]

// ** HMAC **

window.crypto.hmac.algorithms;
// returns array of strings: ["HS256", "HS384", "HS512"]

// ** Hash **

window.crypto.hash.algorithms;
// returns array of strings: ["MD5", "SHA1", "SHA2"]
