import UserModel from '.././model/user.model';
import token from '.././utils/token';

class UserService {
    private user = UserModel;

    /**
     * register a new user
     */
    public async register(
        name: string,
        email: string,
        password: string
    ): Promise<string|Error> {
        try {
            const user = await this.user.create({name, email, password})
            const accessToken = token.createToken(user);

            return accessToken
        } catch (error) {
            throw new Error('Unable to create user')
        }
    }

    /**
     * Attempt to login a user
     */

    public async login(
        email:string,
        password: string
    ): Promise<string|Error> {
        try {
            const user = await this.user.findOne({email});
            if(!user){
                throw new Error('unable to find user with that email address')
            }

            if(await user.isValidPassword(password)) {
                return token.createToken(user)
            } else {
                throw new Error('Wrong credentials given')
            }
        } catch (error) {
            throw new Error('Unable to login user')
        }
    }

    /**
     * Update user settings
     */
    public async updateSettings(id: string, data: any): Promise<any> {
        const user = await this.user.findById(id);
        if (!user) throw new Error('User not found');
        if (data.name) user.name = data.name;
        if (data.email) user.email = data.email;
        if (data.slug) user.slug = data.slug;
        if (data.password) user.password = data.password;
        if (data.language) user.language = data.language;
        if (data.dateOfBirth !== undefined) user.dateOfBirth = data.dateOfBirth;
        if (data.bio !== undefined) user.bio = data.bio;
        if (data.location !== undefined) user.location = data.location;
        if (data.profileTheme !== undefined) {
            if (!['ribbons', 'flowfield', 'pillars'].includes(data.profileTheme)) {
                throw new Error('Invalid profile theme');
            }
            user.profileTheme = data.profileTheme;
        }
        if (data.socialLinks) {
            user.socialLinks = {
                ...user.socialLinks,
                ...data.socialLinks
            };
        }
        await user.save();
        return user;
    }

    /**
     * Update user avatar
     */
    public async updateAvatar(id: string, photoUrl: string): Promise<any> {
        const user = await this.user.findById(id);
        if (!user) throw new Error('User not found');
        user.photoUrl = photoUrl;
        await user.save();
        return user;
    }

    /**
     * Get user profile by slug
     */
    public async getProfileBySlug(slug: string): Promise<any> {
        const user = await this.user.findOne({ slug })
            .select('-password -email -role') // Don't expose sensitive fields
            .populate({
                path: 'tracks',
                match: { status: 'public' },
                options: { sort: { createdAt: -1 } }
            })
            .populate({
                path: 'soundkits',
                match: { status: 'public' },
                options: { sort: { createdAt: -1 } }
            })
            .lean();
        
        if (!user) return null;
        return user;
    }
}

export default UserService;