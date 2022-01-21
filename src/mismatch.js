const anchor = require("@project-serum/anchor");
const fs = require("fs");
const {fetchMetadata} = require('./metadata')
const fetch = require('node-fetch');


const provider = anchor.Provider.local(
    // cheap mainnet quiknode
    "https://withered-delicate-bird.solana-mainnet.quiknode.pro/59cfd581e09e0c25b375a642f91a4db010cf27f6/"
    // cheap devnet quiknode
    //'https://rough-late-haze.solana-devnet.quiknode.pro/9fe6af89a46090ee7d3e295e7087eb63c586ba94/'
);

const findPair = async () => {

    // all mint addresses to update (if unlocked)
    let listMints = '../files/eye-mints.json'
    let read = fs.readFileSync(listMints)
    let mints = JSON.parse(read)
    console.log('##### START #####')
    console.log('length = ', mints.length)


    let list = []
    for (let i = 0; i < mints.length; i++) {
        console.log('---------------------------------')
        console.log(`### ${i} ###`)
        console.log('mint: ', mints[i])

        let link1 = "https://eye-of-eleriah.s3.us-west-1.amazonaws.com/3964.json"
        let lockMetadata1 = await (await fetch(link1, { method: "Get" })).json()
        let link2 = "https://eye-of-eleriah.s3.us-west-1.amazonaws.com/3966.json"
        let lockMetadata2 = await (await fetch(link2, { method: "Get" })).json()

        // get metadata JSON from mint
        let newData = await fetchMetadata(mints[i], provider.connection)
        let uri = newData.data.uri
        let newMetadata = await (await fetch(uri, { method: "Get" })).json()

        if (uri == link1) {
            console.log('link1: ', link1)
            console.log('uri: ', uri)

            console.log('LOCK 1: ', lockMetadata1)
            console.log('NEW METADATA: ', newMetadata)

            let obj1 = {
                copy_mint: mints[i],
                uri: uri
            }
            list.push(obj1)
            fs.writeFileSync('../files/pair.json', JSON.stringify(list))
        }

        if (uri == link2) {
            console.log('link2: ', link2)
            console.log('uri: ', uri)

            console.log('LOCK 2: ', lockMetadata2)
            console.log('NEW METADATA: ', newMetadata)

            let obj2 = {
                copy_mint: mints[i],
                uri: uri
            }
            list.push(obj2)
            fs.writeFileSync('../files/pair.json', JSON.stringify(list))
        }
    }
}

const mismatch = async () => {

    // all mint addresses to update (if unlocked)
    let listMints = '../files/eye-mints.json'
    let read = fs.readFileSync(listMints)
    let mints = JSON.parse(read)
    console.log('##### START #####')
    console.log('length = ', mints.length)


    let list = []
    let mismatches = 0
    for (let i = 0; i < mints.length; i++) {
        console.log('---------------------------------')
        console.log(`** ${i} **`)
        console.log('mint: ', mints[i])

        // get metadata JSON from mint
        let data = await fetchMetadata(mints[i], provider.connection)
        let uri = data.data.uri
        let metadata = await (await fetch(uri, { method: "Get" })).json()

        let length = metadata.attributes.length
        let last = metadata.attributes[length - 1]

        console.log('last.trait_type: ', last.trait_type)
        console.log('metadata.image: ', metadata.image)
        if (last.trait_type == "# Prints") {
            if (metadata.image == "https://eye-of-eleriah.s3.us-west-1.amazonaws.com/6-lock.png") {
                mismatches += 1
                console.log('COUNT: ', mismatches)
                console.log('METADATA: ', metadata)

                let obj = {
                    mint: mints[i],
                    uri: uri
                }
                list.push(obj)
                fs.writeFileSync('../files/locked.json', JSON.stringify(list))
            }
        }
    }
    console.log('TOTAL MISMATCHES: ', mismatches)

}
(async () => {
    try {
        await findPair()
    } catch (e) {
        console.log(e)
    }
})()