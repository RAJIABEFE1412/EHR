const hash = require('object-hash');
const TARGET_HASH = 1560;

module.exports.validateApprove = (proof) => {

    guessHash = hash(proof);
    // console.log('hash value:', guessHash);
    return guessHash == hash(TARGET_HASH);

}



module.exports.proofOfWork = () => {
    console.log('hmmmm');
    let proof = 0;
    while (true) {
        if (!module.exports.validateApprove(proof)) {
            proof += 1;
        } else {
            break;
        }
    }

    return hash(proof);
}


