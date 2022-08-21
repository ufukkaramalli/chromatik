
import mongoose from 'mongoose'
import uniqueValidator from 'mongoose-unique-validator'
import slug from 'mongoose-slug-generator'

const Schema = mongoose.Schema
mongoose.plugin(slug);

const trackSchema = new Schema(
    {
      name: {
        type: String,
        minlength: [3, 'Must be three characters long']
      },
      description: {
        type: String,
        default: ''
      },
      art: {
        type: String,
        default: 'no-photo.jpg'
      },
      views: {
        type: Number,
        default: 0
      },
      stream: {
        type: String
      },
      status: {
        type: String,
        enum: ['draft', 'private', 'public'],
        default: 'draft'
      },
      slug: {
          type: String, 
          slug: "name",
          unique: true
      },
      userId: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
      }
    },
    { toJSON: { virtuals: true }, toObject: { virtuals: true }, timestamps: true }
  )
trackSchema.plugin(uniqueValidator, { message: '{PATH} already exists.' })
export default trackSchema