const dns = require('dns');
const express = require('express');
const cors = require('cors');
const dotenv = require("dotenv");
const geoip = require('@avindak/xgeoip');

dotenv.config()

const domainWhiteList = process.env.DOMAIN_WHITELIST.split(',');
const app = express();

app.set('trust proxy', true);
app.use(cors({
  origin: function(origin, callback) {
    if(!origin || domainWhiteList.some('*')) return callback(null, true);

    if(domainWhiteList.some(origin)) {
      return callback(new Error('401'), false);
    }
    return callback(null, true);
  }
}));

app.get('/ip2nation', async(req, res) => {
  geoip.load_memory().then(_ => {
    const ip = req.header('x-forwarded-for') || req.socket.remoteAddress;
    geoip.resolve(ip).then(r => {
      res.send({country: r.country_code, ip});
    }).catch(e => {
      res.send({e, ip});
    })
  });

});

app.listen(8000, '0.0.0.0');
