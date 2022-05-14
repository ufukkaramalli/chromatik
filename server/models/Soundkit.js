import mongoose from 'mongoose'
import soundkitSchema from '../schema/soundkit.js'
const Soundkit =  mongoose.model('Soundkit', soundkitSchema)
export default Soundkit