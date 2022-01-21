const AWS = require("aws-sdk")
const fs = require('fs')
const fetch = require('node-fetch');
const anchor = require("@project-serum/anchor")
const {fetchMetadata} = require('./metadata')
const {createLockLink} = require('./createLockLink')
const {createNewLink} = require('./createNewLink')

const provider = anchor.Provider.local(
    // cheap mainnet quiknode
"https://withered-delicate-bird.solana-mainnet.quiknode.pro/59cfd581e09e0c25b375a642f91a4db010cf27f6/"
    // cheap devnet quiknode
//"https://rough-late-haze.solana-devnet.quiknode.pro/9fe6af89a46090ee7d3e295e7087eb63c586ba94/"
);

const buildUpdateUri = async () => {

    let dataList = [{
        mint_account: "xZ43...",
        new_uri: "https://arweave.net/N36gZYJ6PEH8OE11i0MppIbPG4VXKV4iuQw1zaq3rls"
    }]
    dataList.pop()

    let mints_path = '../files/dups.json'
    let readMints = fs.readFileSync(mints_path)
    let mints = JSON.parse(readMints)

    let data_path = '../files/redactList.json'

    for (let i = 0; i < mints.length; i++) {
        let metadata = await fetchMetadata(mints[i], provider.connection)
        let uri = metadata.data.uri

        let lockLink = await createLockLink(uri)
        console.log('lockLink: ', lockLink);
        //let newLink = await createNewLink(uri)
        //console.log('newLink: ', newLink)

        let newData = {
            mint_account: mints[i],
            new_uri: lockLink
        }
        dataList.push(newData)
        console.log(newData)

        fs.writeFileSync(data_path, JSON.stringify(dataList))
    }

}
buildUpdateUri()