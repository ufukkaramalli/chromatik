import { Document ,Types } from 'mongoose';
import ITrack from './track.interface';

export default interface IUser extends Document {
    email: string;
    name: string;
    password: string;
    role?: string;
    photoUrl?: string;
    language?: string,
    slug?: string,
    dateOfBirth?: Date,
    bio?: string,
    location?: string,
    profileTheme?: 'ribbons' | 'flowfield' | 'pillars',
    socialLinks?: {
        instagram?: string;
        twitter?: string;
        youtube?: string;
        soundcloud?: string;
    };
    isValidPassword(password: string): Promise<Error | boolean>;
}