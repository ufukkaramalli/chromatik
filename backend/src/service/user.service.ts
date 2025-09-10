import UserModel from '.././model/user.model';
import token from '.././utils/token';
import IUser from '.././interfaces/user.interface';

class UserService {
  private user = UserModel;

  /**
   * Register a new user
   */
  public async register(
    name: string,
    email: string,
    password: string
  ): Promise<string | Error> {
    try {
      const user = await this.user.create({ name, email, password });
      const accessToken = token.createToken(user);
      return accessToken;
    } catch (error) {
      throw new Error('Unable to create user');
    }
  }

  /**
   * Attempt to login a user
   */
  public async login(email: string, password: string): Promise<string | Error> {
    try {
      const user = await this.user.findOne({ email });
      if (!user) {
        throw new Error('unable to find user with that email address');
      }

      if (await user.isValidPassword(password)) {
        return token.createToken(user);
      } else {
        throw new Error('Wrong credentials given');
      }
    } catch (error) {
      throw new Error('Unable to login user');
    }
  }

  /**
   * Get all users (with relations)
   */
  public async getAll(): Promise<IUser[]> {
    return this.user.find()
      .populate({ path: 'tracks', select: 'title' })
      .populate('soundkits');
  }

  /**
   * Get user by id (with relations)
   */
  public async getById(id: string): Promise<IUser | null> {
    return this.user.findById(id)
      .populate({ path: 'tracks', select: 'title' })
      .populate('soundkits');
  }

  /**
   * Update a user
   */
  public async update(id: string, updateData: Partial<IUser>): Promise<IUser | null> {
    return this.user.findByIdAndUpdate(id, updateData, { new: true });
  }

  /**
   * Delete a user
   */
  public async delete(id: string): Promise<IUser | null> {
    return this.user.findByIdAndDelete(id);
  }
}

export default UserService;
