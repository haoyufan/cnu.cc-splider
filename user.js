const superagent = require("superagent");
const cheerio = require("cheerio");
const { mapLimit } = require("async");
const info = require('./info.js')
// 爬取得用户id
let userId = process.argv[2] || "534690";

let host = "http://www.cnu.cc";
let uri = `${host}/users/${userId}`;
let images = []
let page = 1
function getPic(next) {
  superagent.get(next).then((res) => {
    let body = res.text;
    $ = cheerio.load(body);
    let list = $('.thumbnail')
    list.each(function(){
        let href = $(this).attr('href').split('/');
        let ids = href[href.length - 1]
        images = images.concat(ids)
    })
    if(list.length == 0){
      mapLimit(images, 4,
        function(temp ,callback) {
          info(temp, callback)
        },
      (err, result) => {
        console.log('用户信息检索完毕')
      });
      return false
    }else{
      page ++
      getPic(`${uri}?page=${page}`);
    }
  });
}

getPic(uri);