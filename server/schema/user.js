import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'
import uniqueValidator from 'mongoose-unique-validator'
const Schema = mongoose.Schema
const UserSchema = new Schema(
    {
        name:{
            type: String   
        },
        email: {
            type: String,
            required: [true, 'Please add an email'],
            unique: true,
            uniqueCaseInsensitive: true,
            match: [
              /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
              'Please add a valid email'
            ]
        },
        photoUrl: {
            type: String,
            default: 'no-photo.jpg'
        },
        language: {
            type: String,
            default: 'en'
        },
        password: {
            type: String,
            required: [true, 'Please add a password'],
            minlength: [6, 'Must be six characters long'],
            select: false
        }
    },
    { toJSON: { virtuals: true }, toObject: { virtuals: true }, timestamps: true }
)
UserSchema.index({ name: 'text' })
UserSchema.virtual('tracks', {
    ref: 'Track',
    localField: '_id',
    foreignField: 'userId',
    justOne: false,
})
UserSchema.virtual('soundkits', {
    ref: 'Soundkit',
    localField: '_id',
    foreignField: 'userId',
    justOne: false
})

UserSchema.plugin(uniqueValidator, { message: '{PATH} already exists.' })
// Ecrypt Password
UserSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        next()
    }
    const salt = await bcrypt.genSalt(10)
    this.password = await bcrypt.hash(this.password, salt)
})

UserSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password)
}
export default UserSchema