const {TOKEN_METADATA_PROGRAM_ID} = require("./constant");
const {PublicKey} = require("@solana/web3.js");
const anchor = require("@project-serum/anchor");
const {Token, TOKEN_PROGRAM_ID} = require("@solana/spl-token");

async function getMetadataPDA(
    mint,
) {
    return (await PublicKey.findProgramAddress(
            [
                Buffer.from('metadata'),
                TOKEN_METADATA_PROGRAM_ID.toBuffer(),
                mint.toBuffer(),
            ],
            TOKEN_METADATA_PROGRAM_ID,
        )
    )[0]
}

async function getMasterEdition(mint) {
    return (await PublicKey.findProgramAddress(
        [
            Buffer.from('metadata'),
            TOKEN_METADATA_PROGRAM_ID.toBuffer(),
            mint.toBuffer(),
            Buffer.from('edition'),
        ],
        TOKEN_METADATA_PROGRAM_ID,
    ))[0];
}


module.exports = {
    getMetadataPDA,
    getMasterEdition,
}