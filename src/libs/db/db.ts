import { MongoClient } from 'mongodb'
import { printConsole } from "../util";


async function connect() {
  const client = await MongoClient.connect(
    process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017',
    {}
  )
  return client.db('kcr-db')
}

export { connect };