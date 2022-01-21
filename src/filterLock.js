const fs = require("fs")
const {fetchMetadata} = require('./metadata')


const filterLock = async (mint, connection) => {

  // get mint metadata
  let allData = await fetchMetadata(mint, connection)

  // isolate index from JSON uri
  let uri = allData.data.uri
  //console.log('filter metadata: ', uri)
  // https://eye-of-eleriah.s3.us-west-1.amazonaws.com/${index}.json

  let checkLock = uri.substring(uri.length - 10)
  console.log('checkLock: ', checkLock)

  // flag locked mint, add to locked.json
  if (checkLock == '-lock.json') {
    console.log('!LOCKED!')

    let lock = [{
      mint: mint,
      uri: uri
    }]
    console.log(lock)

    //fs.writeFileSync('../files/locked.json', JSON.stringify(lock))
    return null
  }

  else {
    console.log('~CLEAN~')
    return uri
  }

}

const filterNoLock = async (mint, connection) => {

  // get mint metadata
  let allData = await fetchMetadata(mint, connection)

  // isolate index from JSON uri
  let uri = allData.data.uri
  //console.log('filter metadata: ', uri)
  // https://eye-of-eleriah.s3.us-west-1.amazonaws.com/${index}.json

  let checkLock = uri.substring(uri.length - 10)
  console.log('checkLock: ', checkLock)

  // flag locked mint, add to locked.json
  if (checkLock == '-lock.json') {
    console.log('! LOCKED !')
    return uri
  }

  else {
    console.log('~ NO LOCK ~')

    return null
  }

}
module.exports = {filterLock, filterNoLock}
