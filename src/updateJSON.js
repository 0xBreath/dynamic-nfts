const AWS = require('aws-sdk');
const fetch = require('node-fetch');


const updateJSON = async (metadataLink, newImageUri) => {

    let metadata = await (await fetch(metadataLink, { method: "Get" })).json()

    console.log('METADATA: ', metadata)
    
    metadata.properties.files[0].uri = newImageUri
    metadata.image = newImageUri

    /*
    metadata.attributes[1] = {"trait_type": "Cycle", "value": "Cycle #4"}

    metadata.description = 
    "This NFT is a window into Project Eluüne's metaverse, it will transform into facets of our story-universe until you decide to lock it. "+ 
    "Once locked it won't transform again. The choice is yours to make: Lock for what you see and lose what potentially comes next. "+
    "Or give up the current artwork to never have it come out again and wait for the next cycle… "+
    "A locked Eye will say Locked Forever in its attributes."
    */
    
    //console.log('Updated Metadata: ', metadata)

    return JSON.stringify(metadata)
}
module.exports = {updateJSON}
