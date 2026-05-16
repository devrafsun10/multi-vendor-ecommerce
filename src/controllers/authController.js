const User = require('../models/user')
const jwt = require('jsonwebtoken')
const {validationResult} = require('express-validator')

exports.register = async (req,res) => {
    try {
        const {name,email,phone,role,password} = req.body

        //simple validation
        if(!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "Name, email and password are required"
            })
        }

        //check if user already exists

        const existingUser = await User.findOne({email: email})
        if(existingUser) {
            return res.status(409).json({
                success: false,
                message: "User with this email already exists"
            })
        }

        //create new user
        const user = new User({
            name : name,
            email : email,
            password : password,
            phone : phone || undefined,
            role : role || 'customer'
        })

        //save user to database
        await user.save()

        res.status(201).json({
            success: true,
            message: "Registration successful! Please login to continue",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        })
        
    }catch (error) {
        console.log(error);
        
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        })
    }
}