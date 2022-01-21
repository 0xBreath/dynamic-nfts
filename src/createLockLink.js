
/*
  @param uri of metadata as JSON on AWS
  use metadataLink of unlocked nft
  to build mirror uri: -lock.json
*/
const createLockLink = async (metadataLink) => {

    //let metadataLink = `https://man-of-ireland.s3.us-west-1.amazonaws.com/0.json`

    let prefix = metadataLink.substring(0, metadataLink.length - 5)
    //console.log('prefix: ', prefix)

    let suffix = '-lock' + metadataLink.substring(metadataLink.length-5)
    //console.log('suffix: ', suffix)

    let lockLink = prefix + suffix
    //console.log('lockLink: ', lockLink)
    
    return lockLink
}
//createLockLink()
module.exports = {createLockLink}
