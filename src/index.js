const puppeteer = require("puppeteer");
const aws = require("aws-sdk");
const fs = require("fs");

const {
  ACCESS_KEY_ID,
  SECRET_ACCESS_KEY,
  REGION,
  URL,
  BUCKET_NAME,
  SUBDIR_PATH
} = process.env;

aws.config.update({
  accessKeyId: ACCESS_KEY_ID,
  secretAccessKey: SECRET_ACCESS_KEY,
  region: REGION
});

const s3 = new aws.S3();
const options = { year: "numeric", month: "2-digit", day: "2-digit" };
const filename =
  new Date()
    .toLocaleDateString("en-AU", options)
    .split("/")
    .reverse()
    .join("-") + ".png";

async function screenshot() {
  console.log("Getting screenshot...");
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  page.setViewport({ width: 1042, height: 1600 });
  await page.goto(URL);
  await page.screenshot({ path: filename });
  await browser.close();
}

async function uploadToS3() {
  console.log("Uploading to S3...");
  fs.readFile(filename, (err, data) => {
    if (err) throw err;
    const params = {
      Bucket: BUCKET_NAME,
      Key: `${SUBDIR_PATH}/${filename}`,
      Body: data
    };
    s3.putObject(params, (err, data) => {
      if (err) {
        console.log(err);
      } else {
        console.log("Successful upload");
      }
    });
  });
}

screenshot()
  .then(() => uploadToS3())
  .catch(err => console.log(err));
