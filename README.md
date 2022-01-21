# dynamic-nfts

PURPOSE
Airdrop a "dynamic NFT" to wallets that hold the initial mint. 
The airdropped NFT clones the attributes from the initial mint NFT, adds some new attributes, and changes the image.
Finally, it airdrops to the wallet that owns the initial mint.

IMPORTANT FILES
./files/eye-mints.json => master list of initial mints
./src/airdrop.js => lfor each eye-mint, it reads metadata, builds airdrop metadata, uploads to AWS, mints NFT on Solana, and sends to mint owner.
./src/transform.js => updates/evolves airdrop NFTs on AWS
./src/modify-metadata.js => updates/fixes metadata issues for airdrop NFTs on AWS
