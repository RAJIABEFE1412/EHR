const http = require('http');
const express = require('express');
const hash = require('object-hash');
const db = require('./blockchain/database');
const chalk = require("chalk");
const blockChain = require('./blockchain/block_chain');
const bodyParser = require('body-parser');
const bc = new blockChain();
var jsonParser = bodyParser.json()
db.onConnect(() => {

    console.log(chalk.green("database connected"));

});


// server
const app = express();
const server = http.createServer(app);

// const base58 = require('bs58');
app.get("/", (req, res) => {

    res.json({
        status: 200,
        message: "Welcome to Doctor Mine"
    });
    // res.sendStatus(200);
});

app.post('/auth/adduser', jsonParser, (req, res) => {
    console.log('received: ', req.body)
    let userData = {

        fullName: req.body.fullName,
        phoneNumber: req.body.phoneNumber,
        email: req.body.email,
        password: hash(req.body.pwd),
        dateOfBirth: Date.parse(req.body.dob),
        gender: req.body.gender
    };



    bc.addnewAsset(userData, 0);
    // let prevhash = bc.lastBlock() ? bc.lastBlock().hash : null;
    bc.addnewBlock(0, res);

    console.log('chain: ', bc.chain);


});


// history add new disease

app.post('/history/addHistory', jsonParser, (req, res) => {
    let historyData = {

        sicknessName: req.body.sicknessName,
        diagnoses: req.body.diagnoses,
        userHash: req.body.userHash,
        doctorHash: req.body.doctorHash,

    };

    bc.addnewAsset(historyData, 1);

    bc.addnewBlock(1, res);




});

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());

app.post('/auth/getOtp', (req, res) => {
    //
    var request = require('./email/otp_email');
    var otpGenerator = require('otp-generator')

    const otp = otpGenerator.generate(6, { upperCase: false, specialChars: false, alphabets: false });

    request.sendMail(req.body.email, otp).then((gotten) => {
        console.log("gotten", gotten);
        res.json({
            status: 200,
            message: "Otp sent sucessfully",
            otp: otp,

        })
    })


})

// get user

app.get('/profile/getUser', (req, res) => {

    bc.getBlock(req.query.hash, 0, res);
})


app.post('/auth/login', (req, res) => {

    bc.getLoginBlock(req.body.email, req.body.pwd, (err, block) => {

        if (err)
            return res.json({
                status: 400,
                message: err
            });
        console.log("block --- ", block, err)
        if(block == null){
            return res.json({
                status: 400,
                message: "Username / password not correct."
            });
        }
        if (block.asset.twoFactorAuth) {
            var request = require('./email/otp_email');
            var otpGenerator = require('otp-generator')

            const otp = otpGenerator.generate(6, { upperCase: false, specialChars: false, alphabets: false });

            request.sendMail(block.asset.email, otp).then((gotten) => {

                return res.json({
                    status: 200,
                    message: "Otp sent sucessfully",
                    data: {
                        otp: otp,
                        block: block
                    }

                });
            });

        } else
            return res.json({
                status: 200,
                message: "User found!",
                data: { block: block }
            });

    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));