require('dotenv').config()
const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const cokkieParser = require('cookie-parser')

const authRoutes = require( './routes/auth')
const swaggerUi = require('swagger-ui-express')
const swaggerSpecs = require('./config/swagger')

const app = express()

//middleware
app.use(express.json({limit : '10kb'}))
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true
}))

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs))
app.use(cokkieParser())

//routes
app.use('/api/v1/auth', authRoutes)

//MongoDb connection
mongoose.connect(process.env.MONGO_URL).then( () => {
    console.log("Mongodb connected successfully");
    
}).catch( (err) => {
    console.log("Mongodb connection error:", err);
    
})

//Server
const port = process.env.PORT || 5000

app.listen( port, () => {
    console.log(`Server running on port: ${port}`);
    
})