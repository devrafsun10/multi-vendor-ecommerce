const {z} = require('zod')


//registration schema

const registrationSchema = z.object({
    name : z.string()
          .min(2, { message: "Name must be at least 2 characters long" })
          .max(50, { message: "Name must be at most 50 characters long" })
          .trim(),
    email : z.string()
            .email({message: "Invalid email address"})
            .toLowerCase()
            .trim(),
    password : z.string()
               .min(8, { message: "Password must be at least 8 characters long"})
               .regex(/[a-z]/, { message: "Password must contain at least one lowercase"})   
               .regex(/[A-Z]/, { message: "Password must contain at least one uppercase"})   
               .regex(/[0-9]/, { message: "Password must contain at least one number"})   
               .regex(/[^a-zA-Z0-9]/, { message: "Password must contain at least one special character"}),
    phone : z.string()
            .regex(/^\+?8801[3-9]\d{8}$/, { message: "Invalid Bangladeshi phone number"})
            .optional(),
    role : z.enum(['customer', 'vendor'], { message: "Invalid role."})
           .optional()
           .default('customer')                    
})

const loginSchema = z.object({
      email : z.string()
            .email({message: "Invalid email address"})
            .toLowerCase()
            .trim(),
    password : z.string()
               .min(8, { message: "Password must be at least 8 characters long"})
               .regex(/[a-z]/, { message: "Password must contain at least one lowercase"})   
               .regex(/[A-Z]/, { message: "Password must contain at least one uppercase"})   
               .regex(/[0-9]/, { message: "Password must contain at least one number"})   
               .regex(/[^a-zA-Z0-9]/, { message: "Password must contain at least one special character"}),
})

module.exports = {
    registrationSchema,
    loginSchema
}