import { Document, Types } from 'mongoose'

export default interface ITrack extends Document{
    name: string,
    description: string,
    art:string,
    status: string,
    views:number,
    url:string,
    slug:string,
    userId: Types.ObjectId
}