//////////////////////////////////////////////////////////////////////////////////////
// W3C Web Cryptography API example JS code, 2012-09-04                             //
//////////////////////////////////////////////////////////////////////////////////////


/////////////////////////////////
// Generate a signing key pair //
/////////////////////////////////

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

var myClearData = myData;

encrypter.processData(myClearData);
encrypter.complete();


////////////////////////////////////////////////////////////////////////////////////////
// Decrypt data                                                                       //
////////////////////////////////////////////////////////////////////////////////////////



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


