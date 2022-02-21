const puppeteer = require('puppeteer')
const nodemailer = require('nodemailer')


const { loginAction } = require('./src/login')
const { getHospitalIds } = require('./src/extractorTarget')
const { mailService } = require('./src/mail')
const { excelGenerator } = require('./src/exel')
const { CONSTANTS } = require('./src/common')
const { surveyParse } = require('./src/surveyparser')

function sleep(hour) {
  const offset = 1000 * 60 * 60 // 1sec(1000) * 1min(60) * 1hour(60)
  return new Promise(resolve => setTimeout(resolve, offset * hour));
}

const startDocument = async () => {
  require('dotenv').config()
  const browser = await puppeteer.launch({ 
    userDataDir: './userData',
    headless: true, 
    args: [
      '--no-sandbox', 
      `--window-size=${CONSTANTS.SCEEN.WIDTH},${CONSTANTS.SCEEN.HEIGHT}`] 
    });
  const page = await browser.newPage()
  await page.setViewport({width: CONSTANTS.SCEEN.WIDTH, height: CONSTANTS.SCEEN.HEIGHT})
  while(true) {
    await page.goto(CONSTANTS.MAIN_LINK)
    await page.waitFor(1500)
    
    await loginAction(page)
    const hospitalIds = await getHospitalIds(page)
    
    const ret = await surveyParse(page, hospitalIds)
    const buffer = await excelGenerator(ret);
  
    await mailService(buffer)
    await sleep(3)
  }
  
  await page.close()
  await browser.close();
}

startDocument()