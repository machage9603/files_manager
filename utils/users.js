import dbClient from './db';
import Password from './passwords';

class UsersCollection {
  static async createUser(email, password) {
    const collection = dbClient.getCollection('users');
    const newUser = { email, password: Password.encryptPassword(password) };
    const commandResult = await collection.insertOne(newUser);
    return commandResult.insertedId;
  }

  static async getUser(query) {
    const collection = dbClient.getCollection('users');
    const user = await collection.findOne(query);
    return user;
  }
}

export default UsersCollection;
