import mongoose from 'mongoose'

const DBconnection = async () => {
    const conn = await mongoose
        .connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        })
        .then(console.log("Bağlantı Başarılı"))
        .catch(err => console.log(err))
}

export default DBconnection