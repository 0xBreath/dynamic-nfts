const AWS = require('aws-sdk');
const fetch = require('node-fetch');


const changeNftJSON = async (metadataLink) => {
    let metadata = await (await fetch(metadataLink, { method: "Get" })).json()

    let attributesList = metadata.attributes
    attributesList[1] = {"trait_type": "Cycle", "value": "Cycle #3"}

    metadata.description = 
    "This NFT is a window into Project Eluüne's metaverse, it will transform into facets of our story-universe until you decide to lock it. "+ 
    "Once locked it won't transform again. The choice is yours to make: Lock for what you see and lose what potentially comes next. "+
    "Or give up the current artwork to never have it come out again and wait for the next cycle… "+
    "A locked Eye will say \"Locked Forever\" in its attributes."
    
    attributesList.push({"trait_type": "# Prints", "value": `#${index}/${total}`})

    //console.log('Updated Metadata: ', metadata)

    return JSON.stringify(metadata)
}


const changeLockJSON = async (metadataLink, index, total) => {
    let metadata = await (await fetch(metadataLink, { method: "Get" })).json()

    //metadata.properties.files[0].uri = "https://eye-of-eleriah.s3.us-west-1.amazonaws.com/5-lock.png"
    //metadata.image = "https://eye-of-eleriah.s3.us-west-1.amazonaws.com/5-lock.png"
    //metadata.attributes[1] = {"trait_type": "Cycle", "value": "Cycle #3"}

    /*
    metadata.properties.creators = [
        {
            address: "3KYRrm18pHpwt4r7trvwoCeUJ4osqKbmTooG4yWeqwm4",
            verified: 1,
            share: 0
        },
        {
            address: "GdsgtxH5XP2akDGow3JFvceTxTCgakKm6KoRgVL315f3",
            verified: 0,
            share: 100
        }
    ]
    */

    
    metadata.description = 
    "This NFT is a window into Project Eluüne's metaverse, it will transform into facets of our story-universe until you decide to lock it. "+ 
    "Once locked it won't transform again. The choice is yours to make: Lock for what you see and lose what potentially comes next. "+
    "Or give up the current artwork to never have it come out again and wait for the next cycle… "+
    "A locked Eye will say Locked Forever in its attributes."
    

    //metadata.attributes.push({"trait_type": "# Prints", "value": `#${index}/${total}`})

    //console.log('Updated Metadata: ', metadata)

    return JSON.stringify(metadata)
}

module.exports = {changeNftJSON, changeLockJSON}