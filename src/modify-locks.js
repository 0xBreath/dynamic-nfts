const anchor = require("@project-serum/anchor");
const AWS = require("aws-sdk")
const fs = require("fs");
const { filterLock, filterNoLock } = require('./filterLock')
const { makeLockKey } = require('./makeLockKey')
const { changeNftJSON, changeLockJSON } = require('./changeJSON')
const { createLockLink } = require('./createLockLink')
const { makeKey } = require('./makeKey');
const fetch = require('node-fetch');

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
);


const put = async (data, fileName, type) => {
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


const modifyLocks = async () => {

    // all mint addresses to update (if unlocked)
    let listMints = '../files/update.json'
    let list = fs.readFileSync(listMints)
    let mints = JSON.parse(list)
    console.log('##### START #####')
    console.log('length = ', mints.length)

    const totalLock = 133
    console.log('totalLock = ', totalLock)

    let updateList = []
    let indexLock = 54
    for (let i = 0; i < mints.length; i++) {
        console.log("=====================================")
        console.log(`^ ${i} ^`)
        let mint = mints[i]

        // return metadataLink if not locked, else return null
        let metadataLink = await filterNoLock(mint, provider.connection)

        // check if nft is unlocked
        if (metadataLink == null) {
            console.log('## FLAG: mint is unlocked')
        }
        // nft is locked -> transform lock.json
        else {

            console.log('mint: ', mint)
            console.log('uri: ', metadataLink)

            let metadata = await (await fetch(metadataLink, { method: "Get" })).json()
            //console.log('METADATA:' , metadata)
            let image = metadata.image
            console.log('image: ', image)

            if (image.substring(image.length - 10) == "5-lock.png") {

                console.log('METADATA: ', metadata)

                indexLock += 1
                console.log('indexLock: ', indexLock)

                // update lock.json metadata
                // returns JSON.stringify(updated JSON)
                let newLock = await changeLockJSON(metadataLink, indexLock, totalLock)
                console.log('Updated Lock: ', JSON.parse(newLock))

                // isolate x-lock.json key from metataLink
                let key = await makeKey(metadataLink)
                console.log('key: ', key)

                // upload new metadata to AWS
                let updatedNFT = await put(newLock, key, 'application/json')
                console.log('NFT: ', updatedNFT)
                
                /*
                // write redacted to JSON for posterity
                let updatedMint = {
                    mint: mint,
                    uri: metadataLink,
                    metadata: JSON.parse(newLock),
                }
                updateList.push(updatedMint)

                const stageJSON = '../files/lock-cache-3.json'
                fs.writeFileSync(stageJSON, JSON.stringify(updateList))  
                */ 
            }
        }
    }
}

(async () => {
    try {
        await modifyLocks()
    } catch (e) {
        console.log(e)
    }
})()
