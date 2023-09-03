require('dotenv').config()
const express = require('express')
const app = express()
const path = require('path')
const errorHandler = require('./middleware/errorHandler.js')
const {logger, logEvents} = require('./middleware/logger.js')
const cookieParser = require('cookie-parser')
const cors = require('cors')
const corsOptions = require('./config/corsOptions.js')
const connectDB = require('./config/dbConn.js')
const mongoose = require('mongoose')
const PORT = process.env.PORT || 3500

console.log(process.env.NODE_ENV)

connectDB()

app.use(logger)

app.use(cors(corsOptions))

app.use(express.json())

app.use(cookieParser())


//tells express where to find static files or images
app.use('/', express.static(path.join(__dirname, 'public')))

app.use('/', require('./routes/root'))
app.use('/users', require('./routes/userRoutes.js'))
app.use('/notes', require('./routes/notesRoutes.js'))


//put last
app.all('*', (req, res) => {
    res.status(404)
    if(req.accepts('html')) {
        res.sendFile(path.join(__dirname, 'views', '404.html'))
    } else if (req.accepts('json')){
        res.json({message: '404 Not Found'})
    }else {
        res.type('txt').send('404 Not Found')
    }
})

//keep last last
app.use(errorHandler)

mongoose.connection.once('open', () => {
    console.log('Connected to MongoDB')
    app.listen(PORT, () => console.log(`Sever running on port ${PORT}`))
})

mongoose.connection.on('error', err => {
    console.log(err)
    logEvents(`${err.no}: ${err.code}\t${err.syscall}\t${err.hostname}`,
    'mongoErrLog.log')

})

