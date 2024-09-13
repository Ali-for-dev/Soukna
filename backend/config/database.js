const mongoose = require('mongoose');

//db connection 
//mongodb devs are retarded nice doc mongodb
//Ps: 4h30 w ana nssiyi ndebuger finalement n7aw la commande useCreateIndex
const connectDatabase = () => {
        mongoose.connect(process.env.DB_LOCAL_URI,{
            useNewUrlParser: true,
            useUnifiedTopology: true
        }).then(con =>{
            console.log(`MongoDB Database connected with Host : ${con.connection.host}`)
        })
}

module.exports = connectDatabase