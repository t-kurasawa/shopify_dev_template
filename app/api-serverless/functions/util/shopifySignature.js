const crypto = require('crypto');
/* --- Check if the given signature is correct or not --- */
const checkSignature = function(json) {
    let temp = JSON.parse(JSON.stringify(json));
    console.log(`checkSignature ${JSON.stringify(temp)}`);
    if (typeof temp.hmac === 'undefined') return false;
    let sig = temp.hmac;
    // console.log(`sig ${sig}`);
    delete temp.hmac; 
    let msg = Object.entries(temp).sort().map(e => e.join('=')).join('&');
    // console.log(`msg ${msg}`);
    const hmac = crypto.createHmac('sha256', process.env.SHOPIFY_API_SECRET);
    hmac.update(msg);
    let signarure =  hmac.digest('hex');
    // console.log(`signarure ${signarure}`);
    return signarure === sig ? true : false;
};

module.exports = checkSignature