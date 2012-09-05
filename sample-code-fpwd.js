//////////////////////////////////////////////////////////////////////////////////////
// W3C Web Cryptography API example JS code, 2012-09-04                             //
//////////////////////////////////////////////////////////////////////////////////////

/**
    The Web Cryptography API operates on ArrayBufferView arguments and enables:

    1. Signing
    2. Encryption
    3. Digests
    4. Verification
    5. Decryption

    Such ArrayBufferView arguments can be generated as part of application data
    or be obtained from ancillary sources, such as the underlying file system or
    web storage.

    If using the underlying file system, data can be read asynchronously as an
    ArrayBuffer using the File API and the resulting ArrayBuffer can be converted
    to an ArrayBufferView.

    The examples in this section presume a secret message which is converted to
    an ArrayBufferView, although these examples can also apply to ArrayBufferView
    payloads from the underlying file system or web storage.

**/

var secretMessage = "53kr3t M355ag3 for A1ic3";

// Convert this to a Uint16Array
 
var myData = toArrayBufferView(secretMessage);


////////////////////////////////////////////////////////////////////////////////////
// Generate a signing key pair, sign some data                                    //
////////////////////////////////////////////////////////////////////////////////////

// Algorithm Object
var algorithm = {
  name: "RSAES-PKCS1-v1_5",
  // AlgorithmParams
  params: {
    modulusLength: 2048,
    publicExponent: 65537
  }
};

var keyGen = window.crypto.createKeyGenerator(algorithm,
                                              false, // temporary
                                              false, // extractable
                                              ["sign"]);

keyGen.oncomplete = function onKeyGenComplete(event)
{
  // The keyGen operation is complete
  console.log("Key ID: " + event.target.key.id);

  // create a "signer" CryptoOperation object
  var signer = window.crypto.createSigner(algorithm, event.target.key);
  signer.oncomplete = function signer_oncomplete(event)
  {
    console.log("The signer CryptoOperation is finished, the signature is: " +
                event.target.result);
  };
  signer.onerror = function signer_onerror(event)
  {
    console.log("The signer CryptoOperation failed");
  };
  // Sign some data:
  signer.init();
  // myDataToSign is a JS ArrayBufferView
  var myDataToSign = myData;

  signer.processData(myDataToSign);
  signer.complete();
};

keyGen.oninit = function onKeyGenInit(event)
{
  console.log("KeyGen CryptoOperation object is initialized");
};

keyGen.onerror = function onKeyGenError(event)
{
  console.error("KeyGen error: " + event.target.error); // is this correct? event.target.error?
};

keyGen.onabort = function onKeyGenAbort(event)
{
  console.error("KeyGen abort: " + event.target.error);
};

keyGen.onprogress = function onKeyGenProgress(event)
{
  console.error("KeyGen Progress!");
};

// Generate the keypair, the key object is available inside the oncomplete handler
keyGen.generate();

////////////////////////////////////////////////////////////////////////////////////////
// Key Storage                                                                        //
////////////////////////////////////////////////////////////////////////////////////////

var encryptionKey = window.keys.getKeyById("one-of-my-crypto-key-ids-for-this-origin");

// This key is no longer needed, I should remove it:
window.keys.removeKeyById(encryptionKey.id);

var otherEncryptionKey = window.keys.getKeyById("another-crypto-key-id-for-this-origin");

////////////////////////////////////////////////////////////////////////////////////////
// PGP Style Encryption                                                               //
////////////////////////////////////////////////////////////////////////////////////////

// Assumed variables in this scope:
// var secretMessageToAlice = anArrayBufferView;
// var alicePubKey = aJWKFormattedPublicKey;

var aesAlgorithm = {
  name: "AES-CBC",
  params: {
    iv: "NjAwNzY3ODgzOTg0NjEzOA=="
  }
};

// Create a keygenerator to produce a one-time-use AES key to encrypt some data
var cryptoKeyGen = window.crypto.createKeyGenerator(aesAlgorithm,
                                                    false, // temporary
                                                    false, // extractable
                                                    ["encrypt"]);

cryptoKeyGen.oncomplete = function ckg_onComplete(event)
{

  var aesKeyId = event.target.key.id; // Key id
  var aesKey = window.crypto.keys.getKeyByKeyId(aesKeyId);

  // Import Alice's RSAES-PKCS1-v1_5 Public Key to be used to wrap this AES
  var alicePubKeyAlg = {
    name: "RSAES-PKCS1-v1_5",
    // AlgorithmParams
    params: {
      modulusLength: 2048,
      publicExponent: 65537
    }
  };

  var publicKeyImporter = window.crypto.createKeyImporter("jwk",
                                                          alicePublicKey, // ArrayBufferView
                                                          alicePubKeyAlg,
                                                          false,
                                                          true,
                                                          ["encrypt"]);

  publicKeyImporter.oncomplete = function pki_oncomplete(event)
  {
    var keyId = event.target.result; // or is this a Key Object?

    var alicePubKey = window.keys.getKeyById(keyId);

    var pubKeyCryptoOp = window.crypto.createEncrypter(alicePubKeyAlg, alicePubKey);

    var aesSymmetricCryptoOp = window.crypto.createEncrypter(aesAlgorithm, aesKey);

    aesSymmetricCryptoOp.oncomplete = function aes_oncomplete(event)
    {
      // the message have been encrypted
      var cipherMessage = event.target.result; // ArrayBufferView

      // Now, we need to wrap the AES key with Alice's public key
      pubKeyCryptoOp.oncomplete = function pkco_oncomplete(event)
      {
        var wrappedKey = event.target.result;
        // Now we can send the cipherMessage and wrappedKey to Alice
        // sendMessage(cipherMessage, wrappedKey); // Ficticious application function
      };
      pubKeyCryptoOp.init();
      pubKeyCryptoOp.processData(secretMessageToAlice);
      pubKeyCryptoOp.complete();

    };

    //  TODO: missing message signature
    aesSymmetricCryptoOp.init();
    aesSymmetricCryptoOp.processData(secretMessageToAlice);
    aesSymmetricCryptoOp.complete();
  };

  publicKeyImporter.import();
};

////////////////////////////////////////////////////////////////////////////////////////
// Utility functions                                                                  //
////////////////////////////////////////////////////////////////////////////////////////
/**

This is very simple synchronous conversion of strings to Uint16Array.
This utility will miss certain UTF-8 or UTF-16 character sequences.

**/
function toArrayBufferView(str) {
  var buf = new ArrayBuffer(str.length*2); // 2 bytes for each char
  var bufView = new Uint16Array(buf);
  for (var i=0, strLen=str.length; i<strLen; i++) {
    bufView[i] = str.charCodeAt(i);
  }
  return bufView;
}


