const AWS = require('aws-sdk');
const fetch = require('node-fetch');


const updateSingleNft = async (metadataLink) => {

    let metadata = await (await fetch(metadataLink, { method: "Get" })).json()
    
    // x-lock.json
    let attributeList = [
        { "trait_type": "Transponder Locked?", "value": "Open to Transmissions" },
        { "trait_type": "Lockable?", "value": "Not Lockable in this State" },
        {"trait_type":"Domain Trait","value":"Buried Temples"},
        {"trait_type":"Dormant Trait","value":"36"},
        {"trait_type":"Domain Trait","value":"Lulutin Groundlands"},
        {"trait_type":"Dormant Trait","value":"14"}
    ]
    metadata.attributes = attributeList

    return JSON.stringify(metadata)
}

const updateSingleLock = async (lockLink) => {

    let metadata = await (await fetch(lockLink, { method: "Get" })).json()

    // x-lock.json
    let attributeList = [
        { "trait_type": "Transponder Locked?", "value": "Closed to Transmissions" },
        { "trait_type": "Lockable?", "value": "Yes" },
        {"trait_type":"Domain Trait","value":"Buried Temples"},
        {"trait_type":"Dormant Trait","value":"36"},
        {"trait_type":"Domain Trait","value":"Lulutin Groundlands"},
        {"trait_type":"Dormant Trait","value":"14"}
    ]
    metadata.attributes = attributeList


    return JSON.stringify(metadata)
}
module.exports = {updateSingleNft, updateSingleLock}
