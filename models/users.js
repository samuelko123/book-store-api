const mongoose = require('mongoose')

const schema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
        select: false,
        validate: [
            {
                validator: v => /(?=.{8,})/.test(v),
                message: 'Password must be at least 8 characters long'
            },
            {
                validator: v => /(?=.*[a-z])/.test(v),
                message: 'Password must contain at least one lower case character'
            },
            {
                validator: v => /(?=.*[A-Z])/.test(v),
                message: 'Password must contain at least one upper case character'
            },
            {
                validator: v => /(?=.*[0-9])/.test(v),
                message: 'Password must contain at least one digit'
            },
            {
                validator: v => /(?=.*[^A-Za-z0-9])/.test(v),
                message: 'Password must contain at least one special character'
            },
        ],
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    role: {
        type: String,
        required: true,
        enum: ['standard', 'admin'],
        default: 'standard'
    },
    verified: {
        type: Boolean,
        required: true,
        default: false,
    },
    login_attempts: {
        type: Number,
        required: true,
        default: 0
    },
    locked: {
        type: Boolean,
        required: true,
        default: false,
    }
}, {
    versionKey: false,
    strict: 'throw',
    strictQuery: true,
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    }
})

module.exports = mongoose.model('users', schema, 'users')