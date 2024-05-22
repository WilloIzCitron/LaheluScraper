// const Humanoid = require("humanoid-js");
const puppeteer = require("puppeteer")
const cheerio = require('cheerio');
const fs = require('fs');
request = require('request');

var download = function(uri, filename, callback){
  request.head(uri, function(err, res, body){
    console.log('content-type:', res.headers['content-type']);
    console.log('content-length:', res.headers['content-length']);

    request(uri).pipe(fs.createWriteStream(filename)).on('close', callback);
  });
};

const writeStream = fs.createWriteStream('scraped.csv');

async function getData(url) {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle2' });
    const data = await page.evaluate(() => {
        return{
            html: document.documentElement.innerHTML
        }
        });
        const $ = cheerio.load(data.html);
        let linkImg = $('#__next > div.Application_content__VOaJf > div.Application_subcontent__gDE_N > main > div:nth-child(1) > article > div > div > img').attr('src');
        let linkVideo = $('#__next > div.Application_content__VOaJf > div.Application_subcontent__gDE_N > main > div:nth-child(1) > article > div > div > video').attr('src');
        if (linkImg != undefined){
        writeStream.write(`linkImg: ${linkImg}\n`)
        download(linkImg, `scraped/${linkImg.replace('https://cache.lahelu.com/',"")}.png`, function(){console.log('Downloaded Scraped Image');})
        } else {
            writeStream.write(`linkVideo: ${linkVideo}\n`)
            download(linkVideo, `scraped/${linkVideo.replace('https://cache.lahelu.com/',"")}.mp4`, function(){console.log('Downloaded Scraped Video');})
        }
        return;
}
// Usage example:
getData('https://lahelu.com/post/PgHLUo8AS');
getData('https://lahelu.com/post/PSQnMj5Dr');
getData('https://lahelu.com/post/PyamM2BKx');

