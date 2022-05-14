
import mongoose from 'mongoose'
import uniqueValidator from 'mongoose-unique-validator'
const Schema = mongoose.Schema
const soundkitSchema = new Schema(
    {
      title: {
        type: String,
        minlength: [3, 'Must be three characters long']
      },
      description: {
        type: String,
        default: ''
      },
      thumbnailUrl: {
        type: String,
        default: 'no-photo.jpg'
      },
      views: {
        type: Number,
        default: 0
      },
      url: {
        type: String
      },
      status: {
        type: String,
        enum: ['draft', 'private', 'public'],
        default: 'draft'
      },
      userId: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
      }
    },
    { toJSON: { virtuals: true }, toObject: { virtuals: true }, timestamps: true }
  )
soundkitSchema.plugin(uniqueValidator, { message: '{PATH} already exists.' })
export default soundkitSchema