// Gecko API usage:

const Cu = Components.utils;
const Cc = Components.classes;
const Ci = Components.interfaces;
const Cr = Components.results;

Cu.import("resource://gre/modules/XPCOMUtils.jsm");
Cu.import("resource://gre/modules/Services.jsm");

XPCOMUtils.defineLazyServiceGetter(this, "KeyGen",
                                   "@mozilla.org/json-web-key-generator;1",
                                   "nsIJWKGenerator");

XPCOMUtils.defineLazyServiceGetter(this, "Encrypter",
                                   "@mozilla.org/json-web-encrypter;1",
                                   "nsIJWEncrypter");

XPCOMUtils.defineLazyServiceGetter(this, "Decrypter",
                                   "@mozilla.org/json-web-encrypter;1",
                                   "nsIJWEDecrypter");

// Alice generates a key:

let keyGenCallback = {
  keyPairGenFinished: function kgc_keyPairGenFinished(aJWK)
  {
    let myJWK = aJWK.toJSON();
    sendAliceKeyToBob(myJWK);
  }
};

// Bob has recieved the key via the server

let plainText = "The toast has landed butter-side-down:(";

let clearData = textToArrayBuffer(plainText); // textToArrayBuffer is assumed

let encryptCallback = {
  encryptComplete: function ec_encryptComplete(aJWE)
  {
    let myJWE = aJWE.toJSON();
    sendMessageToAlice(myJWE);
  }
};

Encrypter.encrypt(clearData, aliceJWK, encryptCallback);

// Alice decrypts the JWE

let decryptCallback = {
  decryptComplete: function (aClearData)
  {
    let plainText = arrayBugffer2Text(aClearData);
    displayMessage(plainText);
  }
};

Decrypter.decrypt(JWEFromBob, ALICE_KEY_ID, decryptCallback);
