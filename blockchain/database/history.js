const mongoose = require('mongoose');
const schema = mongoose.Schema;

let historyChainSchema = new schema({

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
        date: {
            default: Date.now(),
            type: schema.Types.Date,

        },
        sicknessName: {
            required: true,
            type: schema.Types.String,

        },
        medication: {
            required: true,
            type: schema.Types.String,
        },
        illnesstype: {
            required: true,
            type: schema.Types.String,
        },
        diagnoses: {
            required: true,
            type: schema.Types.String,

        },
        userHash: {
            type: schema.Types.String,
            reqquired: true,
        },
        doctorHash: {
            type: schema.Types.String,
            reqquired: true,
        },
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

module.exports = mongoose.model('history', historyChainSchema);