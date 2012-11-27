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

// Convert this to an ArrayBufferView with assumed utility function 'toArrayBufferView'

var myData = toArrayBufferView(secretMessage); // TODO: add a 'utility function' section


////////////////////////////////////////////////////////////////////////////////////
// Generate a signing key pair, sign some data                                    //
////////////////////////////////////////////////////////////////////////////////////

// Algorithm Object
var algorithmKeyGen = {
  name: "RSASSA-PKCS1-v1_5",
  // AlgorithmParams
  params: {
    modulusLength: 2048,
    publicExponent: 65537
  }
};

var algorithmSign = {
  name: "RSA-256",
  // AlgorithmParams
  params: {
    // null?
  }
};

var keyGen = window.crypto.createKeyGenerator(algorithmKeyGen,
                                              false, // temporary
                                              false, // extractable
                                              ["sign"]);

keyGen.oncomplete = function onKeyGenComplete(event)
{
  // The keyGen operation is complete
  console.log("Key ID: " + event.target.key.id);

  // create a "signer" CryptoOperation object
  var signer = window.crypto.createSigner(algorithmSign, event.target.key);
  signer.oncomplete = function signer_oncomplete(event)
  {
    console.log("The signer CryptoOperation is finished, the signature is: " +
                event.target.result);
  };
  signer.onerror = function signer_onerror(event)
  {
    console.log("The signer CryptoOperation failed");
  };

  signer.oninit = function signer_oninit(event)
  {
    signer.processData(myData);
  };

  signer.progress = function signer_onprogress(event)
  {
    signer.complete();
  };

  // Sign some data:
  signer.init();
};

keyGen.onerror = function onKeyGenError(event)
{
  console.error("KeyGen error: " + event.target.error); // is this correct? event.target.error?
};

// Generate the keypair, the key object is available inside the oncomplete handler
keyGen.generate();

////////////////////////////////////////////////////////////////////////////////////
// Key Storage                                                                    //
////////////////////////////////////////////////////////////////////////////////////

var encryptionKey = window.keys.getKeyById("one-of-my-crypto-key-ids-for-this-origin");

// This key is no longer needed, I should remove it:
window.keys.removeKeyById(encryptionKey.id);

var otherEncryptionKey = window.keys.getKeyById("another-crypto-key-id-for-this-origin");

////////////////////////////////////////////////////////////////////////////////////
// PGP Style Encryption                                                           //
////////////////////////////////////////////////////////////////////////////////////

// Assumed variables in this scope:
// var secretMessageToAlice = anArrayBufferView;
// var alicePubKey = aJWKFormattedPublicKey;

var aesAlgorithmKeyGen = {
  name: "AES-CBC",
  params: {
    length: 128
  }
};

var aesAlgorithmEncrypt = {
  name: "AES-CBC",
  params: {
    iv: window.crypto.getRandomValues(myArrayBufferView)
  }
};

// Create a keygenerator to produce a one-time-use AES key to encrypt some data
var cryptoKeyGen = window.crypto.createKeyGenerator(aesAlgorithmKeyGen,
                                                    false, // temporary
                                                    false, // extractable
                                                    ["encrypt"]);

cryptoKeyGen.oncomplete = function ckg_onComplete(event)
{
  // Optionally get the keyId and key via the id:
  // var aesKeyId = event.target.key.id; // Key id
  // var aesKey = window.crypto.keys.getKeyByKeyId(aesKeyId);

  var aesKey = event.target.key;

  // Import Alice's RSAES-PKCS1-v1_5 Public Key to be used to wrap this AES
  var alicePubKeyAlg = {
    name: "RSAES-PKCS1-v1_5",
    // AlgorithmParams
    params: {
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
    var alicePubKey = event.target.result;

    var pubKeyCryptoOp = window.crypto.createEncrypter(alicePubKeyAlg, alicePubKey);

    var aesSymmetricCryptoOp = window.crypto.createEncrypter(aesAlgorithmEncrypt, aesKey);

    aesSymmetricCryptoOp.oncomplete = function aes_oncomplete(event)
    {
      // the message have been encrypted
      var cipherMessage = event.target.result; // ArrayBufferView

      // Now, we need to wrap the AES key with Alice's public key
      pubKeyCryptoOp.oncomplete = function pkco_oncomplete(event)
      {
        var wrappingKey = event.target.result;
        // Now we can send the cipherMessage and wrappingKey to Alice
        // sendMessage(cipherMessage, wrappingKey); // Ficticious application function
      };
      // Begin key wrapping operation
      pubKeyCryptoOp.oninit = function pkco_oninit(event)
      {
        // Provide the aesKey...
        // TODO: Key needs to be exported first to convert to an ArrayBufferView
        // var aesKeyAsBuffer = keyToArrayBufferView(aesKey);
        pubKeyCryptoOp.processData(aesKeyAsBuffer);
      };

      pubKeyCryptoOp.onprogress = function pkci_onprogress(event)
      {
        pubKeyCryptoOp.complete();
      };

      pubKeyCryptoOp.onerror = function pkci_onerror(event)
      {
        console.error("PublicKey wrapping operation failed");
      };

      // Begin wrapping operation of the aesKey
      pubKeyCryptoOp.init();
    };

    aesSymmetricCryptoOp.oninit = function aes_oninit(event)
    {
      aesSymmetricCryptoOp.processData(secretMessageToAlice);
    };

    aesSymmetricCryptoOp.onprogress = function aes_onprogress(event)
    {
      aesSymmetricCryptoOp.complete();
    };

    aesSymmetricCryptoOp.onerror = function aes_onerror(event)
    {
      console.error("AES encryption failed");
    };

    aesSymmetricCryptoOp.init();
  };

  publicKeyImporter.onerror = function pki_onerror(event)
  {
    console.error("There was an error attempting to import a key");
  };
  // Everything begins here as a recipient's key must be imported into the
  // key store to be used
  publicKeyImporter.import();
};































// Assumed variables in this scope:
// var clearDataArayBufferView = convertPlainTextToArrayBufferView("Plain Text Data");

var myIV = new Uint8Array(16);

var aesAlgorithmKeyGen = {
  name: "AES-CBC",
  params: {
    length: 128
  }
};

var aesAlgorithmEncrypt = {
  name: "AES-CBC",
  params: {
    iv: window.crypto.getRandomValues(myIV)
  }
};

// Create a keygenerator to produce a one-time-use AES key to encrypt some data
var cryptoKeyGen = window.crypto.createKeyGenerator(aesAlgorithmKeyGen,
                                                    false, // temporary
                                                    false, // extractable
                                                    ["encrypt"]);

cryptoKeyGen.oncomplete = function ckg_onComplete(event)
{
  // Optionally get the keyId and key via the id:
  // var aesKeyId = event.target.result.id; // Key id
  // var aesKey = window.crypto.keys.getKeyByKeyId(aesKeyId);

  var aesKey = event.target.result;

  var aesSymmetricCryptoOp = window.crypto.createEncrypter(aesAlgorithmEncrypt, aesKey);
  aesSymmetricCryptoOp.oncomplete = function aes_oncomplete(event)
  {
    // the clearData array has been encrypted
    var cipherDataArrayBufferView = event.target.result; // ArrayBufferView
  };

  aesSymmetricCryptoOp.oninit = function aes_oninit(event)
  {
    aesSymmetricCryptoOp.processData(secretMessageToAlice);
  };

  aesSymmetricCryptoOp.onprogress = function aes_onprogress(event)
  {
    aesSymmetricCryptoOp.complete();
  };

  aesSymmetricCryptoOp.onerror = function aes_onerror(event)
  {
    console.error("AES encryption failed");
  };

  aesSymmetricCryptoOp.init();
};

cryptoKeyGen.generate();

