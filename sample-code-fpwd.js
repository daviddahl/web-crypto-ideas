//////////////////////////////////////////////////////////////////////////////////////
// W3C Web Cryptography API example JS code, 2012-09-04                             //
//////////////////////////////////////////////////////////////////////////////////////

/////////////////////////////////
// Generate a signing key pair //
/////////////////////////////////

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
  console.error("KeyGen abort: " + error.taget.error);
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

// Whoops, that key is stale, I should remove it:
window.keys.removeKeyById(encryptionKey.id);

var encryptionKey = window.keys.getKeyById("my-favorite-crypto-key-id-for-this-origin");

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
// Decrypt data                                                                       //
////////////////////////////////////////////////////////////////////////////////////////

