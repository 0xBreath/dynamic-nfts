const anchor = require("@project-serum/anchor");
const fs = require("fs");
const {fetchMetadata} = require('./metadata')
const fetch = require('node-fetch');
const AWS = require("aws-sdk")

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


const revert = async () => {

    // all mint addresses to update (if unlocked)
    let listMints = '../files/sandbox.json'
    let read = fs.readFileSync(listMints)
    let mints = JSON.parse(read)
    console.log('##### START #####')
    console.log('length = ', mints.length)


    for (let i = 0; i < mints.length; i++) {
        console.log('---------------------------------')
        console.log(`** ${i} **`)
        let mint = mints[i].mint
        console.log('mint: ', mint)

        // index of new JSON
        let k = i + 4950
        console.log('$ k = ', k)

        // get metadata JSON from mint
        let data = await fetchMetadata(mint, provider.connection)
        let uri = data.data.uri
        let metadata = await (await fetch(uri, { method: "Get" })).json()
        console.log('INITIAL: ', metadata)
        console.log('verify link: ', uri)
    
        let nftTraits = []
        nftTraits.push({ "trait_type": "Transponder Locked?", "value": "Open to Transmissions" })
        nftTraits.push({ "trait_type": "Cycle", "value": "Cycle #3" })
        for (let a = 2; a < metadata.attributes.length; a++) {
            nftTraits.push(metadata.attributes[a])
        }

        let lockTraits = []
        lockTraits.push({ "trait_type": "Transponder Locked?", "value": "Locked Forever" })
        lockTraits.push({ "trait_type": "Cycle", "value": "Cycle #3" })
        for (let b = 2; b < metadata.attributes.length; b++) {
            lockTraits.push(metadata.attributes[b])
        }       


        let unlockLink = `https://eye-of-eleriah.s3.us-west-1.amazonaws.com/${k}.json`
        let name = `Eye of Eleriah #${k+1}`
        let unlockJSON = {
            "name":name,
            "symbol":"EOE",
            "image":"https://eye-of-eleriah.s3.us-west-1.amazonaws.com/0.png",
            "properties":{
                "files":[{
                    "uri":"https://eye-of-eleriah.s3.us-west-1.amazonaws.com/0.png",
                    "type":"image/png"
                }],
                "category":"image",
                "creators":[
                    {
                        "address":"3KYRrm18pHpwt4r7trvwoCeUJ4osqKbmTooG4yWeqwm4",
                        "verfied":1,
                        "share":0
                    },
                    {
                        "address":"GdsgtxH5XP2akDGow3JFvceTxTCgakKm6KoRgVL315f3",
                        "verified":0,
                        "share":100
                    }
                ]},
                "description":"This NFT is a window into Project Eluüne's metaverse, it will transform into facets of our story-universe until you decide to lock it. Once locked it won't transform again. The choice is yours to make: Lock for what you see and lose what potentially comes next. Or give up the current artwork to never have it come out again and wait for the next cycle… A locked Eye will say Locked Forever in its attributes.",
                "seller_fee_basis_points":702.7,
                "attributes":nftTraits,
                "collection":{
                    "name":"Eye of Eleriah",
                    "family":"Project Eluüne"
                }
            }

            let lockLink = `https://eye-of-eleriah.s3.us-west-1.amazonaws.com/${k}-lock.json`
            let lockJSON = {
                "name":name,
                "symbol":"EOE",
                "image":"https://eye-of-eleriah.s3.us-west-1.amazonaws.com/6-lock.png",
                "properties":{
                    "files":[{
                        "uri":"https://eye-of-eleriah.s3.us-west-1.amazonaws.com/6-lock.png",
                        "type":"image/png"
                    }],
                    "category":"image",
                    "creators":[
                        {
                            "address":"3KYRrm18pHpwt4r7trvwoCeUJ4osqKbmTooG4yWeqwm4",
                            "verfied":1,
                            "share":0
                        },
                        {
                            "address":"GdsgtxH5XP2akDGow3JFvceTxTCgakKm6KoRgVL315f3",
                            "verified":0,
                            "share":100
                        }
                    ]},
                    "description":"This NFT is a window into Project Eluüne's metaverse, it will transform into facets of our story-universe until you decide to lock it. Once locked it won't transform again. The choice is yours to make: Lock for what you see and lose what potentially comes next. Or give up the current artwork to never have it come out again and wait for the next cycle… A locked Eye will say Locked Forever in its attributes.",
                    "seller_fee_basis_points":702.7,
                    "attributes":lockTraits,
                    "collection":{
                        "name":"Eye of Eleriah",
                        "family":"Project Eluüne"
                    }
                }           

        console.log('unlock link: ', unlockLink)
        console.log('new unlockJSON: ', unlockJSON)
        console.log('lock link: ', lockLink)
        console.log('new lockJSON: ', lockJSON)


        let nft = await put(JSON.stringify(unlockJSON), `${k}.json`, 'application/json')
        let lock = await put(JSON.stringify(lockJSON), `${k}-lock.json`, 'application/json')
        console.log('new unlock: ', nft)
        console.log('new lock: ', lock)
    }
}
(async () => {
    try {
        await revert()
    } catch (e) {
        console.log(e)
    }
})()