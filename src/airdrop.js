let users = require("../files/sandbox.json")
const {fetchMetadata} = require("./metadata");
const fetch = require('node-fetch');
const AWS = require("aws-sdk")
const fs = require("fs");
const {getNftTemplate, getNftLockerTemplate} = require("./template");
const {mintNFT} = require("./mint");
const anchor = require("@project-serum/anchor");
const {PublicKey} = require("@solana/web3.js");

const s3 = new AWS.S3({
    // AKIA6FN7Y64E7Z6VULFB
    accessKeyId: "AKIA6FN7Y64E436ENLH6",
    // rOpOCqZRQkxdkLFM2l70eo3s9u0PhkLe5WaaRFpD
    secretAccessKey: "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"
})

const provider = anchor.Provider.local(
        // cheap mainnet quiknode
    "https://withered-delicate-bird.solana-mainnet.quiknode.pro/59cfd581e09e0c25b375a642f91a4db010cf27f6/"
        // cheap devnet quiknode
    //'https://rough-late-haze.solana-devnet.quiknode.pro/9fe6af89a46090ee7d3e295e7087eb63c586ba94/'
        // default dogshit devnet 
    //"https://api.devnet.solana.com"
);

anchor.setProvider(provider);

async function airDrop(mint, index, userPK, i) {
    
    let metaData = await fetchMetadata(mint, provider.connection)
    let userMetadata = await (await fetch(metaData.data.uri, { method: "Get" })).json()

    console.log('original: ', userMetadata)

    // x.json
    let attributesNFT = []
    attributesNFT.push({ "trait_type": "Transponder Locked?", "value": "Open to Transmissions" })
    attributesNFT.push({ "trait_type": "Cycle", "value": "Cycle #3" })
    for (let a = 0; a < userMetadata.attributes.length; a++) {
        attributesNFT.push(userMetadata.attributes[a])
    }
    

    // x-lock.json
    let attributesLOCK = []
    attributesLOCK.push({ "trait_type": "Transponder Locked?", "value": "Closed to Transmissions" })
    attributesLOCK.push({ "trait_type": "Cycle", "value": "Cycle #3" })
    for (let b = 0; b < userMetadata.attributes.length; b++) {
        attributesLOCK.push(userMetadata.attributes[b])
    }


    const nftPNG = fs.readFileSync('../files/lock-history/stage-1.png')
    const lockPNG = fs.readFileSync('../files/lock-history/stage-1.png')
    const nftName = `Eye of Eleriah #${index + 1}`
    const nftUri = `https://eye-of-eleriah.s3.us-west-1.amazonaws.com/0.png`
    const lockUri = `https://eye-of-eleriah.s3.us-west-1.amazonaws.com/1-lock.png`
    
    const nft = JSON.stringify(getNftTemplate(attributesNFT, nftName, nftUri))
    const lock = JSON.stringify(getNftLockerTemplate(attributesLOCK, nftName, lockUri))

    console.log('NFT: ', JSON.parse(nft))
    console.log('LOCK: ', JSON.parse(lock))

    //await uploadToAws(nftPNG, `0.png`, 'image/png')
    //await uploadToAws(lockPNG, `1-lock.png`, 'image/png')
    
    await uploadToAws(nft, `${index}.json`, 'application/json')
    await uploadToAws(lock, `${index}-lock.json`, 'application/json')

    const uriJSON = `https://eye-of-eleriah.s3.us-west-1.amazonaws.com/${index}.json`
    console.log('LINK: ', uriJSON)
    const wallet = anchor.Wallet.local().payer

    await mintNFT(
        provider.connection,
        wallet,
        uriJSON,
        userPK,
        i
    )
}

async function main() {
    let k = 4949
    for (let [i, user] of users.entries()) {
        console.log('===================================')
        console.log('*** INDEX = ', (i+k))
        console.log('SG mint: ', user.stargardenMint)
        await airDrop(user.stargardenMint, (i+k), new PublicKey(user.wallet), i)
    }
}

async function uploadToAws(data, fileName, type) {
    let fileURL = `https://eye-of-eleriah.s3.us-west-1.amazonaws.com/${fileName}`

    // Setting up S3 upload parameters
    const uploadParams = {
        Bucket: 'eye-of-eleriah', // Bucket into which you want to upload file
        Key: fileName, // Name by which you want to save it
        Body: Buffer.from(data), // Local file
        ACL: 'public-read',
        ContentType: type
    }

    await s3.putObject(uploadParams).promise()

    return fileURL
}


(async () => {
    try {
        await main()
    } catch (e) {
        console.log(e)
    }
})()