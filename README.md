# minerscript-js

Spawn wrapper around rad-bfgminer to use a seed phrase to incrementally generate new coinbase receive addresses for
each successful block mined.

The process is spawned with the first address generated from minerIndex.json and then incremented for each successful 
block mined.

After a block is found the process is terminated and it repeats with the next address.


```
npm install

node start_radbfgminer.js

```

