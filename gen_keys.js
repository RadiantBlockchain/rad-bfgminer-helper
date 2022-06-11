'use strict';
const spawn = require('child_process').spawn;
const minerPrivateKey = require('./minerPrivateKey.js');
require('dotenv').config();
 
console.log('---- Utility generate 1000 keys from seed phrase ----')
for (let i = 0; i < 1000; i++) {
  const result = minerPrivateKey.generateKeysFromPhrase(process.env.PHRASE, i);
  console.log('Key @ ', i, " value: ", result);
}
 