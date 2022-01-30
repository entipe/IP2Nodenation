const express = require('express');
const requestIp = require('request-ip');
const {getClientIp} = require("request-ip");
const cors = require('cors');
const dotenv = require("dotenv")

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

  const geoip = require('@avindak/xgeoip');

  geoip.load_memory().then(_ => {
    geoip.resolve(getClientIp(req)).then(r => {
      res.send({country: r.country_code});
    }).catch(_ => {
      res.send({country: ''});
    })
  });
});

app.listen(8000);
