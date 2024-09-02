const mongoose = require('mongoose') //versi 5.12.13

//membuat schema
const Contact = mongoose.model('Contact', {
    nama: {
        type : String,
        required: true,
    },
    noHP : {
        type: String,
        required: true,
    },
    email: {
        type: String

    }
})

module.exports = Contact