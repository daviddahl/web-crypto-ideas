///////////////////////////////////////////////////////////////////////////////
// HighLevel API usage example JavaScript
///////////////////////////////////////////////////////////////////////////////

// Keypair handling, generation ///////////////////////////////////////////////

var myCurrentKeyPair = null;

function onGetKeypair(aKeypair)
{
  localStorage.setItem(aKeypair.id, aKeypair.publicKey);
}

var cryptoAPI = new window.crypto.joseapi();
cryptoAPI.onGetKeypair = onGetKeypair;

function onCreateKeypair(aKeypair)
{
  localStorage.setItem(aKeypair.id, aKeypair.publicKey);
  myCurrentKeyPair = aKeypair;
}

cryptoAPI.onCreateKeypair = onCreateKeypair;

cryptoAPI.createKeypair("RSA1_5");

// encryption /////////////////////////////////////////////////////////////////

var plainText = "June 2012 had an extra holiday shopping weekend, but registered only a 3.3% improvement over June 2011. Without an extra holiday weekend, July 2012 saw almost identical year-over-year growth; 3.4%.";

function onEncryptComplete(aJWE, aPublicKey){
  // XXXddahl: JSMS or JWE???
  // send cipher data to the server for storage, etc...
}
cryptoAPI.onEncryptComplete = onEncryptComplete;
cryptoAPI.encryptAndSign(plainText, RECIPIENT_JWK, SENDER_JWK_ID);

// decryption /////////////////////////////////////////////////////////////////

function onDecryptComplete(aPlainText) {
  // read and save plain text
}

function onDecryptError(aException) {
  // examine exception raised, re-throw or throw a new error
}
cryptoAPI.onDecryptError = onDecryptError;

// we have recvd a new cipher message...
// set the event handler
cryptoAPI.onDecryptComplete = onDecryptComplete;
// verfiy and decrypt - if verification or decryption fails, onDecryptError is fired
cryptoAPI.verifyAndDecrypt(RECEIVED_JWE, SENDER_JWK, RECIPIENT_JWK_ID);

// sign ///////////////////////////////////////////////////////////////////////

var dataToSign = "This is some data to sign";

cryptoAPI.onSignComplete = function (aJWS) {
  // send the signature to the server, etc.
};

cryptoAPI.onSignError = function (aError) {
  // console.log(), etc.
};

cryptoAPI.sign(dataToSign, JWK_ID);

// verify /////////////////////////////////////////////////////////////////////

cryptoAPI.onVerifyComplete = function (aVerified) {
  // aVerified is a boolean
};

cryptoAPI.onVerifyError = function (aError) {
  // console.log(), etc.
};

cryptoAPI.verify(RECEIVED_JWS, SIGNER_JWK);

// hash ///////////////////////////////////////////////////////////////////////
// TBD

