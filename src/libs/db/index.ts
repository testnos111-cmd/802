import { Db, MongoClient } from 'mongodb';
import { connect } from './db'

const conn = connect;

export {
    conn
}