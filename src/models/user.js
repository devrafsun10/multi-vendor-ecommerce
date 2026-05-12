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