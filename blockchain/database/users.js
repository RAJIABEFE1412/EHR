const mongoose = require('mongoose');
const schema = mongoose.Schema;

const userData = new schema();
let userChainSchema = new schema({

    index: {
        required: true,
        unique: true,
        type: schema.Types.Number
    },
    timeStamp: {
        required: true,
        unique: true,
        type: schema.Types.Date,
        default: Date.now()
    },
    asset: {
        gender: {
            required: true,
            type: schema.Types.String,

        },
        fullName: {
            required: true,
            type: schema.Types.String,

        },
        phoneNumber: {
            required: true,
            type: schema.Types.String,

        },
        email: {
            required: true,
            type: schema.Types.String,
            unique: true,
        },
        password: {
            required: true,
            type: schema.Types.String,
        },
        dateOfBirth: {
            type: schema.Types.Date
        },
        twoFactorAuth: {
            type: schema.Types.Boolean,
            default: false,
        },
        profilePicture: {
            default: null,
            type: schema.Types.String,
        }
    },


    previoushash: {
        required: false,
        type: schema.Types.String,

    },

    hash: {

        required: true,
        type: schema.Types.String,
    }

});

module.exports = mongoose.model('users', userChainSchema);