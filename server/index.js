import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'

//Database Connection
import DBconnection from './config/database.js'

// ROUTES
import trackRoutes from './routes/tracks.js'
import userRoutes from './routes/users.js'
import soundkitRoutes from './routes/soundkits.js'

const app = express()
app.use(cors())
app.use(express.json())
dotenv.config({ path: '.env' })

DBconnection()

app.use('/tracks', trackRoutes)
app.use('/users', userRoutes)
app.use('/soundkits', soundkitRoutes)

app.listen(parseInt(process.env.MONGO_URI_PORT),() => {
    console.log(`We are live on ${process.env.NODE_ENV} mode on port ${parseInt(process.env.MONGO_URI_PORT)}`)
})