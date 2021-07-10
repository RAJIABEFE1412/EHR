const http = require('http');
const express = require('express');
const hash = require('object-hash');
const db = require('./blockchain/database');
const chalk = require("chalk");
const blockChain = require('./blockchain/block_chain');
const bodyParser = require('body-parser');
const socketio = require('socket.io');
const bc = new blockChain();
var jsonParser = bodyParser.json()
db.onConnect(() => {

    console.log(chalk.green("database connected"));

});
getOtp = (req, res) => {
    var request = require('./email/otp_email');
    var otpGenerator = require('otp-generator')

    const otp = otpGenerator.generate(6, { upperCase: false, specialChars: false, alphabets: false });

    request.sendMail(req.body.email, otp).then((gotten) => {
        console.log("gotten", gotten);
        res.json({
            status: 200,
            message: "Otp sent sucessfully",
            otp: otp,

        });
    });

}
// server
const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));


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

app.post('/auth/getOtp', getOtp);
app.post('/history/getOtp', getOtp);




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
        if (block == null) {
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

const io = socketio(server);

io.on('connection', socket => {


    socket.on('addHistory', msg => {
        const user = getCurrentUser(socket.id);

        io.to(user.room).emit('message', msg);
    });

    socket.on('getHistories', msg => {
        // console.log("Are you getting here.....");
        var data =  JSON.parse(msg)
        console.log("data.... ",data.hash)

        var res = bc.getBlock(data.hash, 1);

        console.log("res. ",res);

    
        socket.
            // to(socketId).
            emit('historyResult', res);

    });

    socket.on('disconnect', () => {
        console.log("socket removed");
        // remove id from socket.

        // userCtl.updateStatusDisconnect({
        //     wid: socket.id, jwt: "eyJhbGciOiJSUzI1NiIsImtpZCI6IjEzZThkNDVhNDNjYjIyNDIxNTRjN2Y0ZGFmYWMyOTMzZmVhMjAzNzQiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL2FjY291bnRzLmdvb2dsZS5jb20iLCJhenAiOiI5NDIzODI5MDU0OTQtNjMxN2hwdWxwdDk1ODg2Mmhocm1jcTA2M2gwNGw1bmIuYXBwcy5nb29nbGV1c2VyY29udGVudC5jb20iLCJhdWQiOiI5NDIzODI5MDU0OTQtNjMxN2hwdWxwdDk1ODg2Mmhocm1jcTA2M2gwNGw1bmIuYXBwcy5nb29nbGV1c2VyY29udGVudC5jb20iLCJzdWIiOiIxMTQwMDczOTcwNzE2NzgwNjMwOTkiLCJlbWFpbCI6ImJhc2UzNi5yckBnbWFpbC5jb20iLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwiYXRfaGFzaCI6Il9TSTVkRjZHV2NlSXc0eXEwZnV6YlEiLCJub25jZSI6IlJncTc3VmRncUJYd281bUg5ODVxUVBxMVJjLWFQS3NqTFpBOVk3RXhnNlUiLCJuYW1lIjoiUmFqaSBSYXNoZWVkIiwicGljdHVyZSI6Imh0dHBzOi8vbGgzLmdvb2dsZXVzZXJjb250ZW50LmNvbS9hLS9BT2gxNEdpU0p0aWZfbWo1XzBCUEF6T2xiMmJzT1JYLVNrakF4d3RFLUZ0aWVnPXM5Ni1jIiwiZ2l2ZW5fbmFtZSI6IlJhamkiLCJmYW1pbHlfbmFtZSI6IlJhc2hlZWQiLCJsb2NhbGUiOiJlbiIsImlhdCI6MTYxNzQ0OTc5MCwiZXhwIjoxNjE3NDUzMzkwfQ.a2KH8l9F6zLbDcloLO7egZCVYIgWL53rotAO8mZKo9CvfA4_alyHsL_cHaNuXEZcX_nYyrDqQeG-eXGWk9W6FXQu_5kD2I3DtunCtOOtL1hacm847fC7jsTmMC4O5SxCYo_sZCnGxB1ye-dbdtMmaCt56vefFOcoHkabTmEv-11ajTc-Sk_STPie-pNBt1m8WXcniOBms3uF_q-8rGBo5ts_op1S1VWZ-vs6a9tpIoS8HPvbA862uFHkMNOry0dbsJf5vClWCFTPlolP37MbC18OSGcAMH0VQrcYCP-Vi9jP5qI8xMSpUKgdZ_k5yj_rXCaXIqRLpyd8jiWVtejxTw"
        // }, () => {

        //     console.log("svdv");
        //     const user = userLeave(socket.id);


        //     if (user) {
        //         // io.to(user.room).emit(
        //         //     'message',
        //         //     formatMessage(botName, `${user.username} has left the chat`)
        //         // );

        //         // Send users and room info
        //         // io.to(user.room).emit('roomUsers', {
        //         //     room: user.room,
        //         //     users: getRoomUsers(user.room)
        //         // });
        //     }
        // });

    });
});


// module.exports = ws_connect;

