/* A script to verify session key.
 * Copyright 2022 MIDL.dev
 * All inputs come from environment variables:
 * 
 *  
 *  * STASH_ACCOUNT_ADDRESS: the address of the validator's stash
 *  * STASH_ACCOUNT_ALIAS: an alias for your validator
 *  * 
 *
 *
 *  To run continously, put the following script in a cronjob.
 *  See for reference: https://opensource.com/article/17/11/how-use-cron-linux
 * 
 * */

// Import the API
const { ApiPromise, WsProvider } = require('@polkadot/api');



//set the e-mail which receives alerts
const REACIVING_ALERT_MAIL = 'coderdrawtest@gmail.com'

/* 
 alert_postman function will send an email to REACIVING_ALERT_MAIL on the case of key mismach:
 The sendgrid api key will receaved from env and stored in SEND_GRID_API_KEY

  CODERDRAW.
*/

function alert_postman(error_text,error_mail) {

  var nodemailer = require('nodemailer');

  var transporter = nodemailer.createTransport({
    service: "SendGrid",
    auth: {
      user: 'apikey',
      pass:  process.env.SEND_GRID_API_KEY
    }
  });

  
  var mailOptions = {
    from: 'dionysuspostman@yandex.com',
    to: error_mail,
    subject: "Session Key Mismach Alert!",
    text: error_text
  };

  transporter.sendMail(mailOptions, function(error, info){
    if (error) {
      console.log(error);
    } else {
      console.log('Email sent: ' + info.response);
    }
    exit();
  });  
}



async function main () {
    const provider = new WsProvider('wss://rpc.polkadot.io') //wss://${process.env.NODE_ENDPOINT}`);
    

    // Create the API and wait until ready
    const api = await ApiPromise.create({ provider });

//from polkadot-k8s

  const stash_account =  '12CJw9KNkC7FzVVg3dvny4PWHjjkvdyM17mmNfXyfucp8JfM'//process.env.STASH_ACCOUNT_ADDRESS;
  const stash_alias = 'DI0NYSUS' // process.env.STASH_ACCOUNT_ALIAS; //optional
  // https://wiki.polkadot.network/docs/build-ss58-registry
  const currentBlockNum = (await api.rpc.chain.getHeader()).number;

  console.log("Polkadot Session Key Verificator by MIDL.dev");
  console.log("Copyright 2022 MIDLDEV OU");
  console.log("***");
  console.log(`Current block number:          ${currentBlockNum.toHuman()}`);
  console.log(`Stash account address:         ${stash_account}`);
  console.log(`Stash account alias:           ${stash_alias}`);
  console.log(`Node RPC endpoint in use:      ${'wss://rpc.polkadot.io'}`); //process.env.NODE_ENDPOINT}`);
  let nextKeys = await api.query.session.nextKeys(stash_account);
  console.log(`Node's next keys: ${nextKeys}`);
  console.log(`Node's next keys in hex: ${nextKeys.toHex()}`);
  let nodeHasKeys = await api.rpc.author.hasSessionKeys(nextKeys.toHex());
  console.log(`Local node has the session keys necessary to validate: ${nodeHasKeys}`);
  if (nodeHasKeys.isFalse) {
    let message = `Node ${stash_alias} does not have the session keys advertised on-chain in local storage. Expected session key: ${nextKeys.toHex().substring(0, 12)}...`;
    console.error(message);
    console.log('KEY MISMACH!');
      alert_postman(message,REACIVING_ALERT_MAIL);
      console.log(message);

         
  }
  console.log("Exiting");
  process.exit(0);
   
}



main().catch(console.error);

