
const { bsv } = require('scryptlib');
const bip39 = require('bip39');
const fs = require('fs');
const crypto = require('crypto');
var randomBytes = crypto.randomBytes(16); // 128 bits is enough
var mnemonic = bip39.entropyToMnemonic(randomBytes.toString('hex'));

bip39.validateMnemonic(mnemonic);

const jsonFileReader = async (filePath) => {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, (err, fileData) => {
      if (err) {
        return reject(err);
      }
      try {
        const object = JSON.parse(fileData)
        return resolve(object);
      } catch (err) {
        console.log('jsonFileReader', err);
        return reject(null);
      }
    })
  });
}

const jsonFileWriter = async (filePath, data) => {
  return new Promise(function (resolve, reject) {
    fs.writeFile(filePath, JSON.stringify(data), 'utf8', function (err) {
      if (err) {
        console.log('jsonFileWriter', err);
        reject(err);
      }
      else resolve();
    });
  })
};

const getCurrentAddressIndex = async () => {
  const result = await jsonFileReader('./minerIndex.json');
  return result.index;
};

const updateCurrentAddressIndex = async (val) => {
  jsonFileWriter('./minerIndex.json', {
    index: val
  });
};

const generateKeysFromPhrase = (phrase, index) => {
  const seed = bip39.mnemonicToSeedSync(phrase);
  const hdPrivateKey = bsv.HDPrivateKey.fromSeed(seed, bsv.Networks.mainnet);
  const hdPublicKey = bsv.HDPublicKey.fromHDPrivateKey(hdPrivateKey)
  const derived = [];
  const childn = hdPrivateKey.deriveChild(`m/44'/0'/0'/0/` + index);
  derived.push({
    'path': '0/' + index,
    'address': childn.publicKey.toAddress().toString(),
    'publicKey': childn.publicKey,
    'privateKey': childn.privateKey,
    'privateKeyWif': childn.privateKey.toWIF(),
  });

  return {
    xpub: hdPublicKey.toString(),
    xprv: hdPrivateKey.toString(),
    address: derived[0].address,
    addressPath: derived[0].path,
    addressPublicKey: derived[0].publicKey,
    addressPrivateKey: derived[0].privateKey,
    addressPrivateKeyWif: derived[0].privateKeyWif,
    derivedChildren: derived
  }
}

const getNextAddressFromIndex = async () => {
  if (!process.env.PHRASE) {
    throw new Error('no phrase set');
  }
  const currentIndex = await getCurrentAddressIndex();
  const keys = generateKeysFromPhrase(process.env.PHRASE, currentIndex);
  return keys.address;
};

const incrementAddressIndex = async () => {
  const currentIndex = await getCurrentAddressIndex();
  await updateCurrentAddressIndex(currentIndex + 1);
};

console.log('----------------------------------------------------');
console.log('Mnemonic seed phrase random every time (NOT USED) -->', mnemonic, '<--');

const firstKeys = generateKeysFromPhrase(mnemonic, 0);
console.log('Showing first address associated with the random mnemonic seed phrase... ');
console.log('Address: ', firstKeys.address)
console.log('Private Key WIF: ', firstKeys.addressPrivateKeyWif)
console.log('xpriv: ', firstKeys.xprv)
console.log('xpub: ', firstKeys.xpub)
console.log('----------------------------------------------------');

module.exports = {
  getNextAddressFromIndex,
  incrementAddressIndex,
  generateKeysFromPhrase
}
