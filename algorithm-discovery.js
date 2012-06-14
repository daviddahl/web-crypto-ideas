// Discover what algorithms are supported by the different methods, using IETF JOSE JWA, see: http://tools.ietf.org/html/draft-ietf-jose-json-web-algorithms-02

// ** Block Encryption **

window.crypto.sym.algorithms.blockenc;
// returns an object:
{ A128CBC: true, A256CBC: true, A128GCM: false, A256GCM: false }

// ** Bulk Encryption **

window.crypto.pk.algorithms.bulkenc;
// returns an object:
{ A128CBC: true, A256CBC: true, A128GCM: false, A256GCM: false }

// ** Key Agreement / Encryption **

window.crypto.pk.algorithms.keyenc;
// returns an object:
{ RSA1_5: true, "RSA-OAEP": true, "ECDH-ES": false , A128KW: true, A256KW: true }

// ** Signature algorithms **

window.crypto.sign.algorithms;
// returns an object:
{ RS256: true, RS384: true , RS512: true, ES256: false, ES384: false , ES512: false }

// ** HMAC **

window.crypto.hmac.algorithms;
// returns an object: { HS256: true, HS384: true, HS512: true }

// ** Hash **

window.crypto.hash.algorithms;
// returns an object:
{ MD5: true, SHA1: true, SHA2: true }

// Algorithm Discovery function:

window.crypto.discover("A128CBC");
// returns true
