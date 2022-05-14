import mongoose from 'mongoose'
import trackSchema from '../schema/track.js'
const Track =  mongoose.model('Track', trackSchema)
export default Track