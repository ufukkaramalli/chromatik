
import mongoose from 'mongoose'

const trackSchema = mongoose.Schema({
    user_id:{
        type: Number,
        required: true
    },
    name:{
        type: String,
        required: true
    }
})
export default trackSchema