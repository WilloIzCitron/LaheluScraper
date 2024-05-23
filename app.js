// const Humanoid = require("humanoid-js");
const puppeteer = require("puppeteer")
const cheerio = require('cheerio');
const fs = require('fs');
request = require('request');

var download = function (uri, filename, callback) {
  request.head(uri, function (err, res, body) {
    console.log('content-type:', res.headers['content-type']);
    console.log('content-length:', res.headers['content-length']);

    request(uri).pipe(fs.createWriteStream(filename)).on('close', callback);
  });
};

const writeStream = fs.createWriteStream('scraped.json');

async function getMedia(url) {
  console.log("Booting up Puppeteer...")
  const browser = await puppeteer.launch({ headless: true });
  console.log("Creating new page...")
  const page = await browser.newPage();
  console.log(`Directing to ${url}...`)
  await page.goto(url, { waitUntil: 'networkidle2' });
  const data = await page.evaluate(() => {
    return {
      html: document.documentElement.innerHTML
    }
  });
  const $ = cheerio.load(data.html);
  let linkImg = $('#__next > div.Application_content__VOaJf > div.Application_subcontent__gDE_N > main > div:nth-child(1) > article > div > div > img').attr('src');
  let linkNSFWImg = $("head").find(`[property="og:image"]`).attr('content');
  let linkVideo = $('#__next > div.Application_content__VOaJf > div.Application_subcontent__gDE_N > main > div:nth-child(1) > article > div > div > video').attr('src');
  let title = $('#__next > div.Application_content__VOaJf > div.Application_subcontent__gDE_N > main > div:nth-child(1) > article > header > h1').text();
  let authorName = $('#__next > div.Application_content__VOaJf > div.Application_subcontent__gDE_N > main > div:nth-child(1) > article > header > div > div > div > div > a > span').text();
  let authorAvatar = $('#__next > div.Application_content__VOaJf > div.Application_subcontent__gDE_N > main > div:nth-child(1) > article > header > div > div > a > div > img').attr('src');
  let authorLink = "https://lahelu.com/user/" + authorName;
  let isNSFW = $('#__next > div.Application_content__VOaJf > div.Application_subcontent__gDE_N > main > div:nth-child(1) > article > div > div > span.Typography_align-center__w7M5Z.Typography_bold__PsxB7').text() == "KONTEN SENSITIF";
  if (!isNSFW) {
    if (linkImg != undefined) {
      console.log("Image found! fetching...")
      writeStream.write(`{\n"linkImg": "${linkImg}",\n"authorName":"${authorName}",\n"authorAvatar":"${authorAvatar}",\n"authorLink":"${authorLink}",\n"title":"${title.replace(`\"`, '')}"\n}\n`)
      download(linkImg, `scraped/${linkImg.replace('https://cache.lahelu.com/', "")}.png`, function () { console.log('Downloaded Scraped Image'); })
    } else {
      console.log("Video found! fetching...")
      writeStream.write(`{\n"linkVideo": "${linkVideo}",\n"authorName":"${authorName}",\n"authorAvatar":"${authorAvatar}",\n"authorLink":"${authorLink}",\n"title":"${title.replace(`\"`, '')}"\n}\n`)
      download(linkVideo, `scraped/${linkVideo.replace('https://cache.lahelu.com/', "")}.mp4`, function () { console.log('Downloaded Scraped Video'); })
    }
  } else {
    if (linkNSFWImg.includes('image')) {
      console.log("Image NSFW found! fetching...")
      writeStream.write(`{\n"linkNSFWImg": "${linkNSFWImg}",\n"authorName":"${authorName}",\n"authorAvatar":"${authorAvatar}",\n"authorLink":"${authorLink}",\n"title":"${title.replace(`\"`, '')}"\n}\n`)
      download(linkNSFWImg, `scraped/${linkNSFWImg.replace('https://cache.lahelu.com/', "")}.png`, function () { console.log('Downloaded Scraped Image'); })
    } else {
      console.log('nsfw video not supported!')
    }
  }
  page.close();
  return;
}
// Usage example:
getMedia('https://lahelu.com/post/P00pWZ88J');
