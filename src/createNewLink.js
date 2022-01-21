
/*
  @param uri of metadata as JSON on AWS
  use metadataLink of unlocked nft
  to build mirror uri: -lock.json
*/
const createNewLink = async (link) => {

    //let metadataLink = `https://man-of-ireland.s3.us-west-1.amazonaws.com/${index}.json`

    
    let beforeBucketName = link.substring(0, 8)
    let bucket = 'dup-in-isolate'
    let afterBucketName = link.substring(22)

    let newLink = beforeBucketName + bucket + afterBucketName
    //console.log('newLink: ', newLink)

    return newLink
    
}
//createNewLink()
module.exports = {createNewLink}
