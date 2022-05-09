import mongoose from 'mongoose'
import trackSchema from '../schema/track.js'
const Track =  mongoose.model('track', trackSchema)
export default Track