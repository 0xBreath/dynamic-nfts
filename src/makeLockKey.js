const AWS = require('aws-sdk');
const fetch = require('node-fetch');
const {fetchMetadata} = require('./metadata')

/*
  @param uri of metadata as JSON on AWS
  use metadataLink of unlocked nft
  to build mirror uri: -lock.json
*/
const makeLockKey = async (metadataLink) => {

  //console.log('uri: ', metadataLink)

  // isolate index from JSON uri
  // https://man-of-ireland.s3.us-west-1.amazonaws.com/${index}.json

  let idx = metadataLink.substring(50, metadataLink.length-5)
  //console.log('idx: ', idx)

  let suffix = '-lock' + metadataLink.substring(metadataLink.length-5)
  //console.log('suffix: ', suffix)

  let lockKey = idx + suffix;

  return lockKey

}
module.exports = {makeLockKey}
