const puppeteer = require('puppeteer')
const fs = require('fs')
const axios = require('axios')
const imageType = require('image-type')
const { loginAction } = require('./src/login')
const { getHospitalIds } = require('./src/extractorTarget')
//https://www.penup.com/main/home
const mainLink = 'https://yonseipsychology.au1.qualtrics.com/Q/MyProjectsSection'
const windowWidth = 1920
const windowHeight = 1080

const debugEl = async (page, component) => {
  let classString = await page.evaluate(el => el.className, component)
  let idString = await page.evaluate(el => el.id, component)
  let dataTestId = await page.evaluate(el => el.getAttribute('data-testid'), component)
  console.log(`Calss ${classString} id ${idString} testId ${dataTestId}`)
}

const startDocument = async () => {
 
  const browser = await puppeteer.launch({ 
    userDataDir: './userData',
    headless: false, 
    args: [
      '--no-sandbox', 
      `--window-size=${windowWidth},${windowHeight}`] 
    });
  const page = await browser.newPage()
  await page.setViewport({width: windowWidth, height: windowHeight})
  await page.goto(mainLink)
  await page.waitFor(1500)
  
  await loginAction(page)
  const hospitalIds = await getHospitalIds(page)
  console.log(hospitalIds)
}

startDocument()