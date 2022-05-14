import mongoose from 'mongoose'
import userSchema from '../schema/user.js'
const Users =  mongoose.model('User', userSchema)
export default Users