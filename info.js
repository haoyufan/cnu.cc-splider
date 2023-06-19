let superagent = require("superagent");
let fs = require("fs");
const cheerio = require("cheerio");
const { mapLimit } = require("async");
const path = require("path");
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
let id = process.argv[2] || "";
let data = path.join(__dirname, `./data`);
if (!fs.existsSync(data)) {
  fs.mkdirSync(data);
}
let host = "http://www.cnu.cc";
function getPic(id, callback = () => {}) {
  if(!id)return false
  console.log(`开始抓取id: ${id}`)
  let uri = `${host}/works/${id}`;
  superagent.get(uri).then((res) => {
    let body = res.text;
    $ = cheerio.load(body);
    let images = eval($("#imgs_json").html());
    // 保存标题
    const title = $(".work-title").html().trim()
    // 保存文件夹
    const background = `data/${id}-${title}`;
    mapLimit(images, 4, (temp, callback) => {
      const speed = Math.ceil(Math.random(100) * 500 + 500);
      let timer = setTimeout(() => {
        clearTimeout(timer);
        let nameArr = temp.img.split("/");
        let name = nameArr[nameArr.length - 1];
        let imgUrl = `http://imgoss.cnu.cc/${temp.img}`;
        // 开始下载
        if (!fs.existsSync(path.join(__dirname, `./${background}/`))) {
          fs.mkdir(path.join(__dirname, `./${background}/`), () => {
            copy(imgUrl, `./${background}/` + name, callback);
          });
        } else {
          copy(imgUrl, `./${background}/` + name, callback);
        }
      }, speed);
    }, (err, result) => {
      console.log(id + "信息检索完毕,保存地址.");
      callback()
    });
  });
}


function copy(form, to, callback) {
  let url = form;
  console.log("获取图片链接：", url);
  var file = fs.createWriteStream(path.resolve(__dirname, to));
  superagent.get(url).pipe(file);
  file.on("finish", function () {
    callback();
  });
}
getPic()
module.exports = getPic
