const AWS = require('aws-sdk');
const fetch = require('node-fetch');


const updateRedactJSON = async (metadataLink, newImageUri) => {

    let metadata = await (await fetch(metadataLink, { method: "Get" })).json()

    //console.log('oldImage: ', metadata.image)
    //console.log('newImage: ', newImageUri)

    metadata.properties.files[0].uri = newImageUri
    metadata.image = newImageUri
    metadata.attributes[0].value = "Broken Transmission"
    metadata.attributes[1].value = "Locked"

    //console.log('Updated Metadata: ', metadata)

    return JSON.stringify(metadata)
}
module.exports = {updateRedactJSON}
