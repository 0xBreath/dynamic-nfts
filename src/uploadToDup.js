const AWS = require("aws-sdk")
const fs = require('fs')
const fetch = require('node-fetch');
const anchor = require("@project-serum/anchor")
const {fetchMetadata} = require('./metadata')
const {createLockLink} = require('./createLockLink')
const {createNewLink} = require('./createNewLink')

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
  let fileURL = `https://dup-in-isolate.s3.us-west-1.amazonaws.com/${fileName}`

  // Setting up S3 upload parameters
  const uploadParams = {
      Bucket: 'dup-in-isolate', // Bucket into which you want to upload file
      Key: fileName, // Name by which you want to save it
      Body: Buffer.from(data), // Local file
      ACL: 'public-read',
      ContentType: type
  }

  await s3.putObject(uploadParams).promise()

  return fileURL
}


const uploadToDup = async () => {
    // JSON containing old eye-of-eleriah metadata links
    const readOld = '../files/update.json'
    const openOld = fs.readFileSync(readOld)
    const oldList = JSON.parse(openOld)
    console.log('old length: ', oldList.length)

    // JSON containing new dup-in-isolate metadata links
    const readNew = '../files/redactList.json'
    const openNew = fs.readFileSync(readNew)
    const newList = JSON.parse(openNew)
    console.log('new length: ', newList.length)

    for (let x = 0; x < oldList.length; x++) {

        if (oldList.length == newList.length) {
            console.log('~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~')
            // fetch metadata from old uri
            let account = await fetchMetadata(oldList[x].eyeMint, provider.connection)
            // establish old uri
            let oldUri = account.data.uri
            // establish new uri
            let newUri = newList[x].new_uri

            // fetch metadata JSON
            let metadata = await (await fetch(oldUri, { method: "Get" })).json()

            console.log('METADATA LINK: ', metadata)
            console.log('METADATA STRUCT: ', oldList[x].oldMetadata)

            // isolate object key from AWS link
            let oldKeyIdx = oldUri.substring(50, oldUri.length - 5)
            console.log('oldKeyIdx: ', oldKeyIdx)
            let newKeyIdx = newUri.substring(50, newUri.length - 5)
            console.log('newKeyIdx: ', newKeyIdx)

            // upload metadata to new link
            let newNftUri = await put(JSON.stringify(metadata), `${newKeyIdx}.json`, 'application/json')
            let newLockUri = await put(JSON.stringify(metadata), `${newKeyIdx}-lock.json`, 'application/json')

        }
    }
}
uploadToDup()