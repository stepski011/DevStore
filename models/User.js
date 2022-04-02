const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const UserSchema = new mongoose.Schema({

    name: {
        type: String,
        required: [true, 'Add a name!']
   },

    email: {
    type: String,
    require: [true, 'Add an e-mail'],
    unique: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email'
    ]
  },

  role:{
      type:String,
      enum: ['user', 'publisher'],
      default: 'user'
  },

  password:{
      type: String,
      required: [true, 'Add a password'],
      minlength: 6,
      select: false
  },
  
  resetPasswordToken: String,
  resetPasswordExpire: Date,

  createdAt: {
      type: Date,
      default: Date.now
  }
});

//Enkripcija sifre
UserSchema.pre('save', async function(next){
  if(!this.isModified('password')){
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Sign JWT and return
UserSchema.methods.getSignedJwtToken = function(){
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE
  });
};

//Match passwords
UserSchema.methods.matchPasswords = async function(enteredPassword){
  return await bcrypt.compare(enteredPassword, this.password);
};

// Generate and hash password token
UserSchema.methods.getResetPasswordToken = function(){
  const resetToken = crypto.randomBytes(20).toString('hex');

  // Hashing and setting token
  this.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
 
  this.resetPasswordExpire = Date.now()+10*60*1000;

  return resetToken;
}


module.exports = mongoose.model('User', UserSchema);
