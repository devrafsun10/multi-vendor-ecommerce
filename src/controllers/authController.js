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

exports.login = async (req,res) => {
    try {
        const {email,password} = req.body
        if(!email || !password) {
            return res.status(400).json({
                success: false,
                message: " Email and password are required"
            })
        }
        //Find user and select password
        const user = await User.findOne({email}).select('+password')
        if(!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid credentials"
            })
        }
        const isMatch = await user.comparePassword(password)
        if(!isMatch) {
            return res.status(401).json({
                success: false,
                message: "Invalid credentials"
            })
        }
        
        //Generate tokens
        const accessToken = jwt.sign({
            id: user._id,
            role: user.role,
            email: user.email,
        }, process.env.JWT_ACCESS_SECRET,
         { expiresIn: process.env.ACCESS_TOKEN_EXPIRY })

         const refreshToken = jwt.sign({
            id: user._id,
        }, process.env.JWT_REFRESH_SECRET,
         { expiresIn: process.env.REFRESH_TOKEN_EXPIRY })

         //save refresh token to user
         user.refreshTokens.push({
            token: refreshToken,
            createdAt: new Date(),
            // expiresAt: new Date(Date.now() + 7*24*60*60*1000) optional
         })

         await user.save()

         res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7*24*60*60*1000,
            path: "/"
         })

         res.status(200).json({
            success: true,
            message: "Login successful",
            accessToken,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                isEmailVerified: user.isEmailVerified
            }
         })

    }
    catch (error) {
        console.error("Error during Login:", error)
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        })
    }
}

exports.refreshToken = async (req,res) => {
    try {
        const refreshToken = req.cookies.refreshToken
        if(!refreshToken) {
            return res.status(401).json({
                success: false,
                message: "No refresh token provided"
            })

            //find user with the refresh token
            const user = await User.findOne({
                refreshTokens: { $elemMatch: { token: refreswhToken}}
            })

            if(!user) {
                res.clearCookie('refreshToken')
                return res.status(403).json({
                    message: "Invalid refresh token"
                })
            }

            //verify refresh token
            jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET, async (err,decoded)=> {
                if(err) {
                    res.clearCookie('refreshToken')
                return res.status(403).json({
                    message: "Invalid or expired refresh token"
                }) 
                }

                const newAccessToken = jwt.sign({
                    id: user._id,
                    role: user.role,
                    email: user.email
                },
                 process.env.JWT_ACCESS_SECRET,
            { expiresIn: process.env.ACCESS_TOKEN_EXPIRY})

            res.status(200).json({
                success: true,
                accessToken: newAccessToken,
            })
            })
        }       
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Internal server error"
        })
    }
}