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
// Encryption                                                                         //
////////////////////////////////////////////////////////////////////////////////////////

var encrypter = window.crypto.createEncrypter(algorithm, encryptionKey);

encrypter.oncomplete = function encypter_oncomplete(event)
{
  console.log("Encryption operation complete, ArrayBuffer result: " + event.target.result);
  // Now the encrypted data can be sent to a server or postMessage'd to another window, etc.
};

encrypter.oninit = function encrypter_init(event)
{
  console.log("Encrypter object initialized");
};

encrypter.onerorr = function encrypter_onerror(event)
{
  console.error("Encryption operation failed:(");
};

encrypter.onabort = function encrypter_abort(event)
{
  console.error("Encryption operation aborted!");
};

encrypter.progress = function encrypter_progress(event)
{
  console.log("Encrypter object has progress!");
};

// Begin the encryption operation:
encrypter.init();
// myClearData is a JS ArrayBuffer View
encrypter.processData(myClearData);
encrypter.complete();


////////////////////////////////////////////////////////////////////////////////////////
// Decrypt data                                                                       //
////////////////////////////////////////////////////////////////////////////////////////

