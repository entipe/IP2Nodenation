const express = require('express');
const requestIp = require('request-ip');
const {getClientIp} = require("request-ip");
const cors = require('cors');
const dotenv = require("dotenv");
const networkInterfaces = require('os').networkInterfaces;


dotenv.config()

const domainWhiteList = process.env.DOMAIN_WHITELIST.split(',');
const app = express();

app.use(requestIp.mw());
app.use(cors({
  origin: function(origin, callback) {
    if(!origin || domainWhiteList.some('*')) return callback(null, true);

    if(domainWhiteList.some(origin)) {
      return callback(new Error('401'), false);
    }
    return callback(null, true);
  }
}));

app.get('/ip2nation', (req, res) => {
  const apiKey = req.query.apiKey;

  const getLocalExternalIp = () => [].concat.apply([], Object.values(networkInterfaces()))
    .filter(details => details.family === 'IPv4' && !details.internal)
    .pop().address

  const geoip = require('@avindak/xgeoip');

  geoip.load_memory().then(_ => {
    const ip = getClientIp(req);
    geoip.resolve(ip).then(r => {
      res.send({country: r.country_code, ip, localIp: getLocalExternalIp()});
    }).catch(e => {
      res.send({e, ip, localIp: getLocalExternalIp()});
    })
  });
});

app.listen(8000);
