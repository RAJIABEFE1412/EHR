const mongoose = require('mongoose');

let userModel = require('./users');
// connect to mongoose

// mongoose.connect("mongodb://localhost:27017/docMine", () => {
//     if (err) return console.log('an error occurred', err);
//     console.log('database connected');
// })

const uri = "mongodb+srv://base36rr:Abolarinwa1412@cluster0.njpsk.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";

// const client = new 

mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true }, (err) => {
    if (err) return console.log('an error occurred', err);
    // console.log('database connected');
    connectionCallback();
});
// client.connect(err => {
//   const collection = client.db("test").collection("devices");
//   // perform actions on the collection object
//   client.close();
// });

let connectionCallback = () => {

}

module.exports.onConnect = (callback) => {
    connectionCallback = callback;
}