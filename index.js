// vals
const express = require("express");
const http = require("http");
const request = require("request");
const fs = require('fs');
const path = require('path');

process.on('uncaughtException', function (err) {});


// app server
const app = express();
const server = http.createServer(app);
const port = process.env.PORT || 5000;
const host = process.env.HOST || 'localhost';

let index = 0;
const url = `https://api.imgur.com/3/gallery/hot/viral/${index}.json`;
const folder = 'archive/';

getJsonData();
function getJsonData() {
    console.log(url);
    request({
        url: url,
        json: true
    }, (error, response, body) => {
        if (!error && response.statusCode === 200) {
            let counter = 0;
            body.data.forEach(memeData => {
                const imageData = memeData.images;
                const imageTitle = memeData.title.split(' ').join('_').split("'").join('').split('"').join('');
                for (let i in imageData) {
                    console.log(imageData[i].link);
                    const imageLink = imageData[i].link;
                    const imageExt = imageData[i].type.split('/')[1];
                    download(imageLink, `${folder}/${imageTitle}${path.extname(imageLink)}`, () => {
                        console.log('done');
                    });
                }
                
                if (counter === body.data.length - 1) {
                    index++;
                    getJsonData();
                }

                counter++;
            })
        }
    });
}

function download(uri, filename, callback){
    request.head(uri, (err, res, body) => {
        const file = fs.createWriteStream(filename, {flags: 'wx'});
        file.on('error', (err) => {
            throw(err);
        });
        request(uri).pipe(file)
        .on('close', callback)
    });
};


// start server
server.listen(port, host => {
    console.log(`Magic is happening on ${port}`);
});