import mongoose from 'mongoose'
import trackSchema from '../schema/track.js'
const trackModel =  mongoose.model('track', trackSchema)
export default trackModel