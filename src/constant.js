const {PublicKey} = require("@solana/web3.js");

const ARWEAVE_PAYMENT_WALLET = new PublicKey(
    '6FKvsq4ydWFci6nGq9ckbjYMtnmaqAoatz5c9XWjiDuS',
);

const TOKEN_METADATA_PROGRAM_ID = new PublicKey(
    'metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s',
);


module.exports = {ARWEAVE_PAYMENT_WALLET, TOKEN_METADATA_PROGRAM_ID}
