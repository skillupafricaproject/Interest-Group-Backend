const express = require('express')
const dotenv = require('dotenv')
const authRouter = require('./routes/auth')
const userRouter = require('./routes/user')
const mongoose = require('mongoose')
const rateLimit = require('express-rate-limit')
const helmet = require('helmet')
const mongoSanitize = require('express-mongo-sanitize')
const xss = require('xss-clean')
const hpp = require('hpp')
const compression = require('compression')
const cors = require('cors')


dotenv.config()
const app = express()
app.use(helmet())

app.use(express.json({ limit: '10kb'}))


//data sanitization against NoSql query injection
app.use(mongoSanitize());

app.use(compression())
app.use(cors())

//data sanitization against against xxs
app.use(xss())



const limiter = rateLimit({
    max: 100,
    windowMS: 60 * 60 * 1000,
    message: 'Too many requests from this IP, please try again in an hour!'
}); 

app.use('/api', limiter)

app.use((req, res, next) => {
    req.requestTime = new Date().toISOString();
    //console.log(req.headers)
    next()
})
//prevent parameter pollution
app.use(hpp({
    whitelist: [
        'duration', 
    ]
}))


const port = process.env.PORT || 3000
app.use('/api/v1/meet', authRouter)
app.use('/api/v1/meet', userRouter)


mongoose.connect(process.env.MONGO_URI, 
    ()=>{console.log('database is connected')})

app.listen(port, ()=>{console.log(`server is running on http:\\localhost:${port}`)})