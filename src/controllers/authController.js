const User = require('../models/user')
const VerificationToken = require('../models/verificationToken')
const jwt = require('jsonwebtoken')
const {validationResult} = require('express-validator')
const nodemailer = require('nodemailer')
const {v4: uuidv4} = require('uuid')

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

        //create verification token
        const token = uuidv4()
        await new VerificationToken({userId: user._id, token}).save()

        //send verification email
        const transporter = nodemailer.createTransport({
            service: process.env.EMAIL_SERVICE,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWORD
            }

        })

        const verificationUrl =`${process.env.APP_URL}/api/v1/auth/verify-email?token=${token}&email=${user.email}`

        const mailOptions = {
            from: `"Multivendor Shop",<${process.env.EMAIL_USER}>`,
            to: user.email,
            subject : "Verify your email - Multivendor Ecommerce",
            html : `
            <h2> Welcome to our platform </h2>
            <p> Hi ${user.name} </p>
            <p>Thank you for registration. Please click the link below to verify your email:</p>
            <a href="${verificationUrl}" target="_blank">Verify Email</a>
            <p> This link will expire in 24 hours. </p>
            <p> best regards, <br/> Multivendor Ecommerce Team </p>
            `
        }

        try {
            await transporter.sendMail(mailOptions)
            console.log("Email send");
            
        } catch (error) {
            console.error("Error sending verification email:", error)
            return res.status(500).json({
                success: false,
                message: "Error sending verification email"
            })
        }

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