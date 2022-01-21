const anchor = require("@project-serum/anchor");
const AWS = require("aws-sdk")
const {filterLock} = require('./filterLock')
const {makeLockKey} = require('./makeLockKey')
const {makeKey} = require('./makeKey')
const {createLockLink} = require('./createLockLink')
const {updateSingleNft} = require('./updateSingleJSON')
const {updateSingleLock} = require('./updateSingleJSON')


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


    const updateSingle = async () => {

        let mint = "8iKJZPwTu6EDEuE5G5ovZaT4aZ5CQkgbSbALASrp1y5g"


        console.log("=====================================")
        // filter mint -> locked or not?
        // return metadataLink if not locked, else return null
        let metadataLink = await filterLock(mint, provider.connection)

        // check if nft is locked
        if (metadataLink == null) {
            console.log('## FLAG: mint is locked')
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
            let newNft = await updateSingleNft(metadataLink)
            let newLock = await updateSingleLock(lockLink)
            console.log('Updated NFT: ', JSON.parse(newNft))
            console.log('Updated Lock: ', JSON.parse(newLock))


            // upload new metadata to AWS
            let updatedNft = await put(newNft, key, 'application/json')
            let updatedLock = await put(newLock, lockKey, 'application/json')
            console.log('UPDATED NFT: ', updatedNft)
            console.log('UPDATED LOCK: ', updatedLock)
            
        }
    }

(async () => {
    try {
        await updateSingle()
    } catch (e) {
        console.log(e)
    }
})()
