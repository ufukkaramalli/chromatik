import mongoose, { Schema, model } from 'mongoose';
import bcrypt from 'bcrypt';
import IUser from '.././interfaces/user.interface';
//@ts-ignore
import slug from 'mongoose-slug-generator'

mongoose.plugin(slug)
/**
 * @openapi
 * components:
 *   schemas:
 *     createUserInput:
 *       type: object
 *       required:
 *         - name
 *         - email
 *         - password
 *       properties:
 *         name:
 *           type: string
 *           default: John Doe
 *         email:
 *           type: string
 *           default: default@chromatik.com
 *         password:
 *           type: string
 *           default: password123
 *         isValidPassword:
 *           type: string
 *           default: password123
 *     
 *     User:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: "68bc256a54c0705e8e2d0c26"
 *         name:
 *           type: string
 *           example: "Ufuk Karamalli"
 *         email:
 *           type: string
 *           example: "default@chromatik.com"
 *         role:
 *           type: string
 *           example: "producer"
 *         photoUrl:
 *           type: string
 *           example: "no-photo-user.jpg"
 *         language:
 *           type: string
 *           example: "en"
 *         dateOfBirth:
 *           type: string
 *           format: date
 *           example: "1990-01-01"
 *         bio:
 *           type: string
 *           example: "I am a music producer."
 *         location:
 *           type: string
 *           example: "Istanbul, Turkey"
 *         profileTheme:
 *           type: string
 *           enum: [ribbons, flowfield, pillars]
 *           example: "ribbons"
 *         socialLinks:
 *           type: object
 *           properties:
 *             instagram:
 *               type: string
 *             twitter:
 *               type: string
 *             youtube:
 *               type: string
 *             soundcloud:
 *               type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 *           example: "2025-09-06T12:13:30.973Z"
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           example: "2025-09-06T12:13:30.973Z"
 *         slug:
 *           type: string
 *           example: "ufuk-karamalli"
 *         tracks:
 *           type: array
 *           items:
 *             type: string
 *           example: []
 *         soundkits:
 *           type: array
 *           items:
 *             type: string
 *           example: []
 *         id:
 *           type: string
 *           example: "68bc256a54c0705e8e2d0c26"
 */


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
        },
        dateOfBirth: {
            type: Date,
            default: null
        },
        bio: {
            type: String,
            default: ''
        },
        location: {
            type: String,
            default: ''
        },
        profileTheme: {
            type: String,
            enum: ['ribbons', 'flowfield', 'pillars'],
            default: 'ribbons'
        },
        socialLinks: {
            instagram: { type: String, default: '' },
            twitter: { type: String, default: '' },
            youtube: { type: String, default: '' },
            soundcloud: { type: String, default: '' }
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