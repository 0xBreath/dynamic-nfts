const anchor = require("@project-serum/anchor");
const fetch = require('node-fetch');
const AWS = require("aws-sdk")
const fs = require("fs");
const {filterLock} = require('./filterLock')

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


const redact = async () => {

    // all duplicate Eye mint addresses
    let read = '../files/sandbox.json'
    let list = fs.readFileSync(read)
    let dups = JSON.parse(list)
    console.log('##### START #####')
    console.log('length = ', dups.length)

    // new Redacted image to upload to AWS
    const REDACTED_FILE = '../files/lock/BlindedEye.png'
    const redactedImage = fs.readFileSync(REDACTED_FILE)
    let redactedUri = await put(redactedImage, `redacted.png`, 'image/png')


    let redactedList = []
    for (let k = 0; k < dups.length; k++) {
        let i = 514
        console.log('---------------------------------')
        console.log(`* ${i} *`)
        console.log('MINT: ', dups[k])

        // fetch metadata link
        let metadataLink = await filterLock(dups[k], provider.connection)
        console.log('metadata uri: ', metadataLink)

        if (metadataLink == null) {
            console.log('## FLAG: mint already redacted!')
        }
        // proceed with redacting
        else {
            // isolate index from JSON uri
            // https://dup-in-isolate.s3.us-west-1.amazonaws.com/${index}.json
            let key = metadataLink.substring(50, metadataLink.length - 5)
            let numKey = Number(key)
            console.log('key: ', numKey)

            // change metadata within JSON
            let metadata = await (await fetch(metadataLink, { method: "Get" })).json()
            console.log('METADATA: ', metadata)

            
            // construct redacted metadata
            let redacted = metadata
            redacted.name = `Blinded Eye #${i+1}`
            redacted.symbol = 'EOE'
            redacted.image = redactedUri
            redacted.properties.files[0].uri = redactedUri
            redacted.seller_fee_basis_points = 702.7
            redacted.attributes[0].value = "Broken Transmission"
            redacted.attributes[1] = {"trait_type":"Lockable?","value":"Locked"}
            redacted.collection.name = "Eye of Eleriah"
            redacted.collection.family = "Project Eluüne"
            redacted.description =
            "An Eye forever closed... "+ 
            "Only the Blinded holds the answer... "+
            "Of Why. And by Whom. "+  
            "* This NFT is part of Project Eluüne, it is locked and won’t transform."
            
            console.log('REDACTED: ', redacted)
            
        
            /*
            // upload new redacted metadata to AWS
            let newLockUri = await put(JSON.stringify(redacted), `${key}-lock.json`, 'application/json')
            console.log('newLockUri: ', newLockUri)
            let newNftUri = await put(JSON.stringify(redacted), `${key}.json`, 'application/json')
            console.log('newNftUri: ', newNftUri)
            

            // write redacted to JSON for posterity
            let newRedacted = {
                mint_account: dups[k],
                new_uri: newLockUri
            }
            redactedList.push(newRedacted)
            console.log('REDACTED: ', newRedacted)

            const redactFile = '../files/redactList.json'
            fs.writeFileSync(redactFile, JSON.stringify(redactedList))
            */
        }   
    }
}

(async () => {
    try {
        await redact()
    } catch (e) {
        console.log(e)
    }
})()
