let hash = require('object-hash');
const validator = require('./validator');
const mongoose = require('mongoose');
const schema = mongoose.Schema;
let blockchainModel = require("./database/users")
let historyModel = require("./database/history")

const TARGET_HASH = hash(1560);

const chalk = require("chalk");
const { json } = require('express');

class MedicalBC {
    constructor() {
        // create chain

        this.chain = [];
        // assets
        this.asset = [];
    }

    addnewBlock(cases, callback) {

        let block = {
            index: this.chain.length + 1,
            timeStamp: Date.now(),
            asset: this.asset[0],

        };
        // console.log(chalk.bold("block: ", JSON.stringify(block)));

        if (validator.proofOfWork() == TARGET_HASH) {
            // hash block
            block.hash = hash(block);
            console.log("cases -- ", cases);
            // get last block
            var a = this.getlastBlock(cases, (lastBlck,) => {
                // check if we have a valid block
                if (lastBlck) {
                    block.previoushash = lastBlck.hash;
                    block.index = lastBlck.index + 1;
                }
                // add to db
                let newBlock;
                console.log('cases === ', cases);
                if (cases == 0) {
                    newBlock = blockchainModel(block);
                } else if (cases == 1) {
                    newBlock = historyModel(block);
                }

                console.log("newBlock --", newBlock);

                newBlock.save((err) => {
                    if (err) {

                        if (cases == 1) {
                            return {
                                status: 400,
                                message: err

                            }
                        }
                        return callback.json({
                            status: 400,
                            message: err

                        });
                    }
                    if (cases == 1) {
                        console.log("done...")
                        return {
                            status: 200,
                            message: "History has been successfully added",
                            hash: block.hash
                        }
                    }
                    return callback.json({
                        status: 200,
                        message: "User has been successfully added",
                        hash: block.hash
                    })
                });
                this.chain.push(block);
                this.asset = [];

                if (cases == 1) {
                    return a;
                } else {


                    return block;
                }
            });


        }
        //push into chain
    }



    addnewAsset(asset) {
        this.asset.push(asset);
        // console.log("asset :", this.asset);
    }

    isEmpty() {
        return this.asset.length == 0;
    }

    lastBlock() {
        return this.chain.slice(-1)[0];
    }

    getlastBlock(cases, callback) {
        console.log("cases ==", cases);

        if (cases == 0) {
            // userModel
            blockchainModel.findOne({}, null, { sort: { _id: -1 }, limit: 1 }, (err, block) => {

                if (err)
                    return console.log(chalk.red('error: ', err));
                return callback(block);
            });
        } else if (cases == 1) {
            // history model
            historyModel.findOne({}, null, { sort: { _id: -1 }, limit: 1 }, (err, block) => {

                if (err)
                    return console.log(chalk.red('error: ', err));
                return callback(block);
            });
        }
    }

    getBlock(hash, cases, res) {

        if (cases == 0) {
            // userModel
            console.log("hash --", hash);
            blockchainModel.findOne({ hash: hash }, null, { sort: { _id: -1 }, limit: 1 }, (err, block) => {

                if (err)
                    return res.json({
                        status: 400,
                        message: err
                    });
                console.log('data --', block);
                return res.json({
                    status: 200,
                    data: block
                });

            });
        } else if (cases == 1) {
            // history model
            historyModel.findOne({ hash: hash }, null, { sort: { _id: -1 }, limit: 1 }, (err, block) => {
                console.log("data blocks", block, err);

                if (err)
                    return {
                        status: 400,
                        message: err
                    };
                return {
                    status: 200,
                    data: block
                };

            });
        }
    }

    getLoginBlock(email, pwd, callback) {


        // userModel
        let key = hash(pwd);
        blockchainModel.findOne({ 'asset.email': email, 'asset.password': key }, null, {}, callback);
    }
}


module.exports = MedicalBC;