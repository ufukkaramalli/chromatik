import {Schema, model} from 'mongoose'
import ISoundkit from '@/interfaces/soundkit.interface';

const soundkitSchema = new Schema(
    {
      title: {
        type: String,
        minlength: [3, 'Must be three characters long'],
        required:true
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
        required: true,
        type: String
      },
      status: {
        type: String,
        enum: ['draft', 'private', 'public'],
        default: 'draft'
      },
      userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
      }
    },
    { toJSON: { virtuals: true }, toObject: { virtuals: true }, timestamps: true }
  )

  export default model<ISoundkit>('Soundkit', soundkitSchema)