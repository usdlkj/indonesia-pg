const crypto = require('crypto');

exports.getDigest = (req, res) => {
  let jsonStringHash256 = crypto.createHash('sha256').update(req.body.data,"utf-8").digest();
  let bufferFromJsonStringHash256 = Buffer.from(jsonStringHash256);
  res.send({digest: bufferFromJsonStringHash256.toString('base64')}); 
}

exports.getSignature = (req, res) => {
  console.log("----- Component Signature -----")
  let componentSignature = "Client-Id:" + req.body.clientId;
  let digest = req.body.digest;
  componentSignature += "\n";
  componentSignature += "Request-Id:" + req.body.requestId;
  componentSignature += "\n";
  componentSignature += "Request-Timestamp:" + req.body.requestTimestamp;
  componentSignature += "\n";
  componentSignature += "Request-Target:" + req.body.requestTarget;
  // If body not send when access API with HTTP method GET/DELETE
  if (digest) {
    componentSignature += "\n";
    componentSignature += "Digest:" + digest;
  }

  console.log(componentSignature.toString());
  console.log();

  // Calculate HMAC-SHA256 base64 from all the components above
  let hmac256Value = crypto.createHmac('sha256', process.env.DOKU_SECRET_KEY)
    .update(componentSignature.toString())
    .digest();  
    
  let bufferFromHmac256Value = Buffer.from(hmac256Value);
  res.send({signature: bufferFromHmac256Value.toString('base64')});
  // Prepend encoded result with algorithm info HMACSHA256=
  // return "HMACSHA256="+signature;
}

exports.paymentNotification = (req, res) => {
  console.log(req.body);
  res.send(req.body);
}