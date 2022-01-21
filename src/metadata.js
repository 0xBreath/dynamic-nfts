const anchor = require('@project-serum/anchor');
const {Connection, PublicKey} = require("@solana/web3.js");
const {decodeMetadata} = require("./schema");
const {web3} = require("@project-serum/anchor");

const TOKEN_METADATA_PROGRAM_ID = new PublicKey(
    'metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s',
);

async function fetchMetadata (mint, connection) {
    const mintKey = new anchor.web3.PublicKey(mint)

    const m = await getMetadataPDA(mintKey);
    const accInfo = await connection.getAccountInfo(m);
    //console.log(accInfo)

    return decodeMetadata(accInfo.data)
}

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

module.exports = {fetchMetadata, getMetadataPDA}