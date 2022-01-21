const AWS = require("aws-sdk")
const fs = require('fs')
const fetch = require('node-fetch');
const anchor = require("@project-serum/anchor")
const {fetchMetadata} = require('./metadata')

const provider = anchor.Provider.local(
    // cheap mainnet quiknode
"https://withered-delicate-bird.solana-mainnet.quiknode.pro/59cfd581e09e0c25b375a642f91a4db010cf27f6/"
    // cheap devnet quiknode
//'https://rough-late-haze.solana-devnet.quiknode.pro/9fe6af89a46090ee7d3e295e7087eb63c586ba94/'
);


const getLock = async (mint, connection) => {
    // get mint metadata
    let metadata = await fetchMetadata(mint, connection)

    let uri = metadata.data.uri
    console.log('uri: ', uri)
    // https://eye-of-eleriah.s3.us-west-1.amazonaws.com/${index}.json

    let suffix = uri.substring(uri.length - 10)
    console.log('suffix: ', suffix)

    if (suffix == '-lock.json') {
        let metadata = await (await fetch(uri, { method: "Get" })).json()
        let image = metadata.image
        console.log('image: ', image)

        if (image.substring(image.length - 10) == "6-lock.png") {
            return 1
        }
        else {
            return 0
        }
    }
    else {
        return 0
    }
}


const countLocks = async () => {
    // all mint addresses to update (if unlocked)
    let listMints = '../files/eye-mints.json'
    let list = fs.readFileSync(listMints)
    let mints = JSON.parse(list)
    console.log('##### START #####')
    console.log('length = ', mints.length)

    let tally = 0
    let locks = []
    for (let i = 0; i < mints.length; i++) {

        let isLock = await getLock(mints[i] , provider.connection)
        console.log('isLock = ', isLock)

        if (isLock == 1) {
            tally += isLock
            console.log('tally: ', tally)

            locks.push(mints[i])
            fs.writeFileSync('../files/locked.json', JSON.stringify(locks))
        }
    }
    return tally

}
//module.exports = {countLocks}
(async () => {
    try {
        await countLocks()
    } catch (e) {
        console.log(e)
    }
})()