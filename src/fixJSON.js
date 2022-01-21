const AWS = require('aws-sdk');
const fetch = require('node-fetch');


const fixJSON = async (metadataLink) => {

    let metadata = await (await fetch(metadataLink, { method: "Get" })).json()

    metadata.attributes[1].value = "Yes"

    //console.log('Updated Metadata: ', metadata)

    return JSON.stringify(metadata)
}
module.exports = {fixJSON}
