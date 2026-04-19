import { MongoClient } from 'mongodb'

async function runGetStarted() {
    const url = ''
    const client = new MongoClient(url)

    try {
        const database = client.db('')
        const collection = database.collection('')

        const query = {id: '000'}
        const object = await collection.findOne(query)
        console.log(object) 
    } finally {
        await client.close()
    }
}

export interface User {
    id: string,
    name: string
}

// export async function getUser(): Promise<User> {
//     try {
//         const user: User = '';
//         return user;
//     }
// }