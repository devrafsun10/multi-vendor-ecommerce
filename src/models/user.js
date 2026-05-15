const mongoose = require('mongoose')
const {Schema} = mongoose
const bcrypt = require('bcryptjs')

const userSchema = new Schema({
    name : {
        type: String,
        required:[true,'Name is required'],
        trim: true,
        minLength: 2,
    },
    email: {
        type : String,
        required: [true, "Email is required"],
        unique: true,
        lowerCase: true,
        trim: true,
    },
    phone: {
        type : String,
        unique: true,
        sparse: true //documents without a phone field are ignored by the unique index
    },
    password: {
        type : String,
        required: [true,"Password is required"],
        minLength: 8,
        select: false,//used to hide a field from query results by default.
    },
    role: {
        type: String,
        enum : ['customer','vendor','admin'],
        default: 'customer'
    },
    isEmailVerified: {
        type: Boolean,
        default: false
    },
    refreshToken : [{
        token: String,
        createdAt: {
            type:Date,
            default: Date.now
        }
    }],
     createdAt: {
            type:Date,
            default: Date.now
        }
},{timestamps:true})

//hashing the password brfore saving the user document to the database

userSchema.pre('save', async function(next){
    if(!this.isModified('password')) return next()

    const salt = await bcrypt.genSalt(12)
    this.password = await bcrypt.hash(this.password, salt)
    next()
})

//compare the provided password with the hashed password in the database

userSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password)  
}

module.exports = mongoose.model('User', userSchema);