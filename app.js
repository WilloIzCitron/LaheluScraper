const Humanoid = require("humanoid-js");
const cheerio = require('cheerio');
const express = require('express');
const fs = require('fs');
let humanoid = new Humanoid();
const writeStream = fs.createWriteStream('scraped.csv');

const port = process.env.PORT || 4000;

let app = express(port);

humanoid.get("https://lahelu.com/post/PxW2Y04t2") // link target
.then(res => {
        const $ = cheerio.load(res.body);
        let linkImg = $("head").find(`[property="og:image"]`).attr('content'); // get via property from head meta
        writeStream.write(`\nlinkImg: ${linkImg}`)
}).catch(err => console.error(err))

app.listen(port, () => {
    console.log(`Server Established and  running on Port ⚡${port}`)
})

