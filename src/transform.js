const anchor = require("@project-serum/anchor");
const AWS = require("aws-sdk")
const fs = require("fs");
const { filterLock } = require('./filterLock')
const { makeLockKey } = require('./makeLockKey')
const { updateJSON } = require('./updateJSON')
const { createLockLink } = require('./createLockLink')
const { makeKey } = require('./makeKey')
const { fixJSON } = require('./fixJSON')

const s3 = new AWS.S3({
    // AKIA6FN7Y64E7Z6VULFB
    accessKeyId: "AKIA6FN7Y64E436ENLH6",
    // rOpOCqZRQkxdkLFM2l70eo3s9u0PhkLe5WaaRFpD
    secretAccessKey: "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"
})

const provider = anchor.Provider.local(
    // cheap mainnet quiknode
    "https://withered-delicate-bird.solana-mainnet.quiknode.pro/59cfd581e09e0c25b375a642f91a4db010cf27f6/"
    // cheap devnet quiknode (might be disabled?)
    //'https://rough-late-haze.solana-devnet.quiknode.pro/9fe6af89a46090ee7d3e295e7087eb63c586ba94/'
    //'https://api.devnet.solana.com'
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


const transform = async () => {

    // all mint addresses to update (if unlocked)
    let listMints = '../files/eye-mints.json'
    let list = fs.readFileSync(listMints)
    let mints = JSON.parse(list)
    console.log('##### START #####')
    console.log('length = ', mints.length)

    // new Eye image to upload to AWS
    const STAGE_FILE = '../files/lock/stage-2.png'
    const newImage = fs.readFileSync(STAGE_FILE)

    // upload new stage for lock.jsons of unlocked Eyes
    // update newStageIndex manually!
    let newStageIndex = 2
    let newLockImage = await put(newImage, `${newStageIndex}-lock.png`, 'image/png')
    console.log('newLockImage: ', newLockImage)

    // update 0.png, transforms all unlocked eyes
    let newNftUri = await put(newImage, '0.png', 'image/png')
    console.log('newNftImage: ', newNftUri)

    let stageList = []
    let alreadyLock = []
    for (let i = 0; i < mints.length; i++) {
        console.log("=====================================")
        console.log(`^ ${i} ^`)
        console.log('mint: ', mints[i])
        // filter mint -> locked or not?
        // return metadataLink if not locked, else return null
        let metadataLink = await filterLock(mints[i], provider.connection)

        // check if nft is locked
        if (metadataLink == null) {
            console.log('## FLAG: mint is locked')

            /*
            // write redacted to JSON for posterity
            let oldLock = {
                eyeMint: mints[i],
                oldUri: metadataLink,
            }
            alreadyLock.push(oldLock)

            const lockJSON = '../files/lock/stage-4-locked.json'
            fs.writeFileSync(lockJSON, JSON.stringify(alreadyLock))
            */
        }
        // nft is unlocked -> transform lock.json
        else {
            // create x-lock.json from x.json to transform
            let lockLink = await createLockLink(metadataLink)
            console.log('nft uri: ', metadataLink)
            console.log('lock uri: ', lockLink)

            // isolate x-lock.json key from metataLink
            let key = await makeKey(metadataLink)
            let lockKey = await makeLockKey(metadataLink)
            console.log('key: ', key)
            console.log('lockKey: ', lockKey)


            // update lock.json metadata
            // returns JSON.stringify(updated JSON)
            let newMetadata = await updateJSON(lockLink, newLockImage)
            console.log('Updated Lock: ', JSON.parse(newMetadata))

            // upload new metadata to AWS
            /*
            let updatedLock = await put(newMetadata, lockKey, 'application/json')
            console.log('UPDATED: ', updatedLock)
            */

            /*
            // write redacted to JSON for posterity
            let newLock = {
                eyeMint: mints[i],
                oldUri: lockLink,
                oldMetadata: JSON.parse(newMetadata)
            }
            stageList.push(newLock)

            const stageJSON = '../files/lock/stage-4.json'
            fs.writeFileSync(stageJSON, JSON.stringify(stageList))
            */
        }
    }
}

(async () => {
    try {
        await transform()
    } catch (e) {
        console.log(e)
    }
})()
