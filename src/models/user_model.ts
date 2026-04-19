import {db} from "../index";
import {Collection, WithId} from "mongodb";

export interface User {
    name: string,
    email: string,
    passwordHash: string,
    avatarUrl: string,
    createdAt: string,
    updatedAt: string
}

export async function getUser(userId: string): Promise<User|undefined> {
    try {
        const users: Collection<User> = (await db).collection<User>('users')
        const query = {id: userId}
        const userDocument: WithId<User>|null = await users.findOne(query)
        return userDocument as User;
    } catch (error) {
        console.log(error)
    }
}
