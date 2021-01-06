const fs = require('fs')
const http = require('https')
const request = require('request')
const cherio = require("cheerio")
var names = []

var website = process.argv[2]

if (!website.toString().match(/https:\/\/www.redgifs.com\/users\/.+/)) {
    console.warn("Not a vaild website")
    return;
}

request(website, (error, response, html) => {
    if (!error && response.statusCode == 200) {
        const $ = cherio.load(html);

        var head = $('head')

        var username = $('span.user-row__username').text()

        var array = head.children('script').last().toArray()


        var str = array[0].children[0].data
        str = str.match(/"cache":.+"updating":false}/g)

        var json = JSON.parse(str.toString().substring(8))
        var gifs = json.gifs

        console.log(Object.keys(gifs).length)

        for (gif in gifs) {
            var name = gifs[gif]["gfyName"]
            names.push(name)
            console.log(name)
        }

        if (!fs.existsSync("output")) {
            fs.mkdirSync("output");
        }

        if (!fs.existsSync("output/" + username)) {
            fs.mkdirSync("output/" + username);
        }

        names.forEach((name) => {
            const file = fs.createWriteStream("output/" + username + "/" + name + ".mp4")
            const request = http.get("https://thumbs2.redgifs.com/" + name + ".mp4", function (response) {
                response.pipe(file)
            })
        })
    }
})
