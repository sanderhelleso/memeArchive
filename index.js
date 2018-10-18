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
const port = process.env.PORT || 1337;
const host = process.env.HOST || 'localhost';

// run request
const url = `https://api.imgur.com/3/gallery/hot/viral/0.json`;
const folder = 'archive/';
const hours = 3600000 / 4; // 15 min
let collected = 0;

// initiate download proccess
getJsonData();

// download new memes every set hour
setInterval(() => {
    getJsonData();
}, hours);

// get amount of memes
function amountOfMemes() {
    fs.readdir(folder, (err, files) => {
        console.log(`You currently have ${files.length} memes and have collected ${collected} memes since you started script`);
    });
}

// fetch meme json and attempt to download
function getJsonData() {
    amountOfMemes();
    console.log(`ATTEMPTING NEW MEME COLLECTION AT ${new Date()}\n`);
    request({
        url: url,
        json: true
    }, (error, response, body) => {
        if (!error && response.statusCode === 200) {
            console.log('Collecting...');
            body.data.forEach(memeData => {

                // meme img data and title
                const memeImg = memeData.images;
                const memeTitle = memeData.title.split(' ').join('_').split("'").join('').split('"').join('');
                for (let i in memeImg) {

                    // meme link and extension
                    const memeLink = memeImg[i].link;
                    const memeExt = memeImg[i].type.split('/')[1];

                    // check if file allready exists
                    if (!fileExists(memeTitle)) {

                        // download current image
                        download(memeLink, `${folder}/${memeTitle}${path.extname(memeLink)}`, () => {
                            console.log(`Successfully downloaded a new meme: ${memeTitle} at ${new Date()}`);
                            collected++;
                        });
                    }
                }
            })
        }
    });
}

// dowload file from url
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

// check if a file exists
function fileExists(file) {
    if (file === '.') {
        return true;
    }
    try {
        if (fs.existsSync(`${folder}${file}`)) {
            console.log(`Skipped downloading of file: ${file} File allready in archive`);
            return true;
        }
    } 
    catch(err) {
        throw(err);
    }

    return false;
}


// start server
server.listen(port, host => {
    console.log(`Magic is happening on ${port}`);
});