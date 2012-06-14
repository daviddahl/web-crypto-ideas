// Web Crypto API key identifiers ideas
var PubKeyAPI = new window.crypto.pk();

PubKeyAPI.onKeyGenFinished = function onkeygenfinished(aKeyID, aPublicKey) {
  // store the pubkey either on the server or in localStorage, etc.
};

// Generate the keypair:
PubKeyAPI.generateKeys("RSA1_5", ["w3.org", "mozilla.org"]);

// aKeyID in onkeygenfinished:
//
{
  algorithm: "RSA1_5",
  id: "8d88ef7e-3e51-4776-b017-340ba04c954",
  // browsers can create any kind of string ID,
  // perhaps 'mozilla.org/key-234456789.jwk' as well
  boundOrigin: ["w3.org", "mozilla.org"],
}

// Question: will this be returned as an ArrayBuffer or as a JS object?

// Question: what other properties will we need here?

// Question: should this object just be a public key and dispense with the separate 'identifier'?

// Either way, here is an idea for representing a public key as JWK as an ArrayBuffer:
// JS object literal:
{
  alg: 1, // 1 = RSA, char: 49
  kid: "https://mozilla.com/key-1234567890.jwk",
  // char: 104,116,116,112,115,58,47,47,109,111,122,105,108,108,97,46,99,111,109,47,107,101,121,45,49,50,51,52,53,54,55,56,57,48,46,106,119,107
  use: 1, // 1 = enc, char: 49
  boundOrigin:  "mozilla.com,w3.org", // Not an IETF/Jose property
  // char: 109,111,122,105,108,108,97,46,99,111,109,44,119,51,46,111,114,103
  mod: 1234567, // char: 49,50,51,52,53,54,55
  exp: 1, // char: 49
}

// Imagine the Array buffer's data as:

[49,104,116,116,112,115,58,47,47,109,111,122,105,108,108,97,46,99,111,109,47,107,101,121,45,49,50,51,52,53,54,55,56,57,48,46,106,119,107,49,109,111,122,105,108,108,97,46,99,111,109,44,119,51,46,111,114,103,49,50,51,52,53,54,55,49]

// With header data prepended to the above:
[1,38,1,18,7,1]
// Which is the length of each property

// Naturally, DSA and EC keys would have some differing properties as per: http://tools.ietf.org/html/draft-ietf-jose-json-web-key-02

// Following naturally, perhaps there is a need for a utility method to convert this ArrayBuffer public key to JSON?

var jsonKey = myPublicKey.toJSON();
//returns a JWK object with base64 UrlEncoded properties, etc...
