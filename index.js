const http = require('http');
const express = require('express');
const hash = require('object-hash');
const db = require('./blockchain/database');
const chalk = require("chalk");
const blockChain = require('./blockchain/block_chain');
const bodyParser = require('body-parser');

var jsonParser = bodyParser.json()
db.onConnect(() => {

    console.log(chalk.green("database connected"));
    // const blockChain = require('./blockchain/block_chain');
    // const validator = require('./blockchain/validator');
    // const bc = new blockChain();


    // bc.addnewAsset('alex', 'Femi', 5000000);
    // let prevhash = bc.lastBlock() ? bc.lastBlock().hash : null;
    // bc.addnewBlock(prevhash);

    // console.log('chain: ', bc.chain);
});


// server
const app = express();
const server = http.createServer(app);

// const base58 = require('bs58');
app.get("/", (req, res) => {

    res.json({
        status: 200,
        message: "Welcome to Doctor Mine"
    // }); res.sendStatus(200);
});

app.post('/adduser', jsonParser, (req, res) => {
    console.log('received: ', req.body)
    let userData = {

        fullName: req.body.fullName,
        email: req.body.email,
        password: hash(req.body.pwd),
        dateOfBirth: Date.parse(req.body.dob),
        gender: req.body.gender
    };

    const bc = new blockChain();

    bc.addnewAsset(userData, 0);
    // let prevhash = bc.lastBlock() ? bc.lastBlock().hash : null;
    bc.addnewBlock(0, res);

    console.log('chain: ', bc.chain);


});


// history add new disease

app.post('/addHistory', jsonParser, (req, res) => {
    console.log('received: ', req.body)
    let historyData = {

        sicknessName: req.body.sicknessName,
        diagnoses: req.body.diagnoses,
        userHash: req.body.userHash,
        doctorHash: req.body.doctorHash,

    };


    const bc = new blockChain();

    bc.addnewAsset(historyData, 1);
    // let prevhash = bc.lastBlock() ? bc.lastBlock().hash : null;
    bc.addnewBlock(1, res);




});

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());

app.post('/getOtp', (req, res) => {
    //
    var request = require('./email/otp_email');
    var otpGenerator = require('otp-generator')

    const otp = otpGenerator.generate(6, { upperCase: false, specialChars: false, alphabets: false });

    request.sendMail("base36.rr@gmail.com", otp).then((gotten) => {
        console.log("gotten", gotten);
        res.json({
            status: 200,
            message: "Otp sent sucessfully",
            otp: otp,

        })
    })


})

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));