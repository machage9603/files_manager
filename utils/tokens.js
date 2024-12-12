import { v4 } from 'uuid';
import redisClient from './redis';

class AuthTokenHandler {
  static async createAuthToken(user, duration = 60 * 60 * 24) {
    const token = v4();
    await redisClient.set(`auth_${token}`, user._id.toString(), duration);
    return token;
  }

  static async getUserByToken(token) {
    const user = await redisClient.get(`auth_${token}`);
    return user;
  }

  static async deleteAuthToken(token) {
    const status = await redisClient.del(`auth_${token}`);
    return status;
  }
}

export default AuthTokenHandler;
