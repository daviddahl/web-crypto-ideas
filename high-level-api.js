// HighLevel API usage example JavaScript
/////////////////////////////////////////

// Get a "keypair" that will be generated if it does not exist:

var myCurrentKeyPair = null;

function onGetKeypair(aKeypair)
{
  localStorage.setItem(aKeypair.id, aKeypair.publicKey);
  myCurrentKeyPair = aKeypair;
}

var cryptoAPI = window.crypto.highLevel();
cryptoAPI.onGetKeypair = onGetKeypair;

cryptoAPI.getKeypair();

// Create another keypair...

var createdKeyPairs = [];

function onCreateKeypair(aKeypair)
{
  localStorage.setItem(aKeypair.id, aKeypair.publicKey);
  createdKeyPairs.push(aKeypair);
}

cryptoAPI.onCreateKeypair = onCreateKeypair;

cryptoAPI.createKeypair();

var plainText = "June 2012 had an extra holiday shopping weekend, but registered only a 3.3% improvement over June 2011. Without an extra holiday weekend, July 2012 saw almost identical year-over-year growth; 3.4%.";

function toArrayBuffer(aPlainText) { // returns an Uint8Array
}

var clearData = toArrayBuffer(plainText);

function onEncryptComplete(aCipherData, aPublicKey){
  // send cipher data to the server for storage, etc...
}
cryptoAPI.onEncryptComplete = onEncryptComplete;
cryptoAPI.encryptAndSign(clearData, localStorage.getItem('alicePubKey'));

function onDecryptComplete(aPlainText) {
  // read and save plain text back to localStorage/IndexedDB
}

function onDecryptError(aException) {
  // examine exception raised, re-throw or throw a new error
}
cryptoAPI.onDecryptError = onDecryptError;

// we have recvd a new cipher message...
// set the event handler
cryptoAPI.onDecryptComplete = onDecryptComplete;
// verfiy and decrypt - if verification or decryption fails, onDecryptError is fired
cryptoAPI.decryptAndVerify(cipherMessage);

// TODO: sign, verify, hash, MAC
