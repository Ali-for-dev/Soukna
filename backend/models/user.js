const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto')

const userSchema = new mongoose.Schema({
    name:{
        type: String,
        required: [true, 'Please enter your name'],
        maxLength:[30 , 'Your name cannot exceed 30 characterts']
    },
    email: {
        type: String,
        required: [true,'Please enter your email'],
        unique: true,
        validator:[validator.isEmail,'Please enter valid email address']
    },
    password:{
        type: String ,
        required: [true,'Please enter your password'],
        minlength: [6,'Your password must be longer than 6 characters'],
        //quand je veux afficher l'utilisateur je n'affiche pas le mp
        select: false
    },
    avatar: {
        public_id: {
            type: String,
            required: true
        },
        url: {
            type: String,
            required: true
        }
    },
    role: {
        type: String,
        default:'user'
    },
    createdAt:{
        type: Date,
        default: Date.now
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date

})


//Encryption of passwords (user)
//avant d'enregistrer le client il faut faire un traitement
userSchema.pre('save',async function(next) {
    if(!this.isModified('password')){
        next()
    }
    this.password = await bcrypt.hash(this.password, 10)
})


//Comparaison du mot de passe :
userSchema.methods.comparePassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password)
}

//return JSON Web Token 
userSchema.methods.getJwtToken = function(){

    return jwt.sign({id: this._id}, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_TIME
    });
}

//Generation du mot de passe pour reint token
userSchema.methods.getResetPasswordToken = function() {
    //Generate Token
    const resetToken = crypto.randomBytes(20).toString('hex');

    //hashage et l'envoi du resetPasswordToken
    this.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex')

    //Time zone for token expire
    this.resetPasswordExpire = Date.now() + 30 * 60 * 1000

    return resetToken

}





module.exports = mongoose.model('User',userSchema);