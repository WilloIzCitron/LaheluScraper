const Humanoid = require("humanoid-js");
const cheerio = require('cheerio');
const express = require('express');
const fs = require('fs');
request = require('request');

var download = function(uri, filename, callback){
  request.head(uri, function(err, res, body){
    console.log('content-type:', res.headers['content-type']);
    console.log('content-length:', res.headers['content-length']);

    request(uri).pipe(fs.createWriteStream(filename)).on('close', callback);
  });
};

let humanoid = new Humanoid();
const writeStream = fs.createWriteStream('scraped.csv');

const port = process.env.PORT || 4000;

let app = express(port);

humanoid.get("https://lahelu.com/post/PxW2Y04t2") // link target
.then(res => {
        const $ = cheerio.load(res.body);
        let linkImg = $("head").find(`[property="og:image"]`).attr('content'); // get via property from head meta
        writeStream.write(`linkImg: ${linkImg}`)
        download(linkImg, 'scraped/fetched.png', function(){
            console.log('Downloaded Scraped Image');})
}).catch(err => console.error(err))

app.listen(port, () => {
    console.log(`Server Established and  running on Port ⚡${port}`)
})

