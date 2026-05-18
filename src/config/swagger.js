const { version } = require('mongoose');
const swaggerJsdoc = require('swagger-jsdoc');

const options = {
    defination: {
        openapi: '3.0.0',
        info : {
            title : 'Multivendor Ecommerce API',
            version: '1.0.0',
            description : 'API for large scale multivendor ecommerce application(Mern Stack)'

        },
        contact: {
            name: ' Syed Rafsun Iyajdani Siyam ',
            email: "ssiyam152@gmail.com",
        },
        servers: [
            {
                url: `http://localhost:${process.env.PORT || 5000}`,
                description: 'Development server'
            },
            {
                components: {
                    securitySchemas: {
                        bearerAuth: {
                            type: 'http',
                            schema: 'bearer',
                            bearerFormat: 'JWT'
                        }
                    }
                }
            }
        ]
    },
    apis: ['./src/routes/*.js','./src/controllers/*.js']
}

const specs = swaggerJsdoc(options)

module.exports = specs