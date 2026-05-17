const verificationToken = require("../models/verificationToken")
const User = require("../models/user")

exports.verifyEmail = async (req,res) => {
    const { token, email } = req.query

    try {
        const verificationToken = await verificationToken.findOne({ token})
        if(!verificationToken) {
            return res.status(400).json({
                sucess: false,
                message: "Invalid or expired verification token"
            })
        }

        const user = await User.findById(verificationToken.userId)

        if(!user || user.email !== email) {
            return res.status(400).json({
                sucess: false,
                message: "Invalid request"
            })
        }

        user.isEmailVerified = true
        await user.save()

        await verificationToken.deleteOne({_id: verificationToken._id})

        //forntend redirect url
        res.redirect(`${process.env.FORNT_END_URL}/verify-success?email=${user.email}`)
    }
    catch (error) {
        console.error("Error verifying email:", error)
        res.status(500).json({
            success:false,
            message: "Server error while verifying email"
        })
    }
}