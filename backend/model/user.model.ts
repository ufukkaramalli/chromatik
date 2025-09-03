import mongoose, { Schema, model } from 'mongoose';
import bcrypt from 'bcrypt';
import IUser from '@/interfaces/user.interface';
//@ts-ignore
import slug from 'mongoose-slug-generator'

mongoose.plugin(slug)

const UserSchema = new Schema(
    {
        name: {
            type:String,
            required: true
        },
        email: {
            type:String,
            required: true,
            unique: true,
            trim: true
        },
        password: {
            type:String,
            required: true
        },
        role: {
            type:String,
            default:'producer',

        },
        slug: {
            type:String,
            slug:"name",
            unique:true
        },
        photoUrl: {
            type:String,
            default:'no-photo-user.jpg'
        },
        language: {
            type: String,
            default: 'en'
        }
    },
    { toJSON: { virtuals: true }, toObject: { virtuals: true }, timestamps: true }
);

UserSchema.virtual('tracks', {
    ref: 'Track',
    localField: '_id',
    foreignField: 'userId',
    justOne: false
})

UserSchema.virtual('soundkits', {
    ref: 'Soundkit',
    localField: '_id',
    foreignField: 'userId',
    justOne: false
})

UserSchema.pre<IUser>('save', async function (next) {
    if (!this.isModified('password')){
        return next();
    }

    const hash = await bcrypt.hash(this.password, 10)
    this.password = hash

    next();
})

UserSchema.methods.isValidPassword = async function (password:string): Promise<Error | boolean> {
    return await bcrypt.compare(password, this.password)
}

export default model<IUser>('User', UserSchema)