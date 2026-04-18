import {MongoClient} from 'mongodb';

const uri = 'mongodb+srv://papyrusUser:123papyrus123@papyrus-cluster.9fqk3t7.mongodb.net/?appName=papyrus-cluster';

const client = new MongoClient(uri)

export default client;