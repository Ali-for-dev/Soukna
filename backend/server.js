const app = require('./app')
const connectDatabase = require('./config/database')

const dotenv = require('dotenv');
const cloudinary = require('cloudinary');

//Handle uncaught exceptions
process.on('uncaughtException', err => {
    console.log(`ERROR: ${err.stack}`);
    console.log('shutting down due to uncaught exception');
    process.exit(1)
})


//Setting up config file 
dotenv.config({ path:'backend/config/config.env'})


//call function for connect db
connectDatabase();

//Setting up cloudinary config file
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
})


const server =  app.listen(process.env.PORT, () =>{
    console.log(`server started on PORT : ${process.env.PORT} in ${process.env.NODE_ENV} mode.`)
})


//Handle Unhadled Promise rejections
process.on('unhadledRejection',err => {
    console.log(`ERROR: ${err.stack}`);
    console.log('shutting down the server due to Unhandled Promise rejection');
    server.close(() => {
        process.exit(1)
    })
})