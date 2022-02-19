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
  
  for(const eachHospitalTagId of hospitalIds) {
    const targetItem = await page.$(`#${eachHospitalTagId}`);
    const hospitalName = (await page.evaluate(e => e.children[0].querySelector('div > span > div').textContent, targetItem)).trim();
    const jumpTag = await page.evaluateHandle(e => e.children[0], targetItem);
    await jumpTag.click()
    await page.waitForSelector('#resource-list')
    // resource-list
    const surveyList = await page.$$('#resource-list > div:first-child > table > tbody > tr');
    const totalSurveyCount = surveyList.length;
    let idx = 0 
    const limitedSubmitCount = 5
    while(idx < totalSurveyCount) {
      
      await page.waitForSelector('#resource-list')
      console.log('start')
      const surveyList = await page.$$('#resource-list > div:first-child > table > tbody > tr');
      console.log(surveyList.length)
      const currentSurvey = surveyList[idx]
      await debugEl(page, currentSurvey)
      await page.waitFor(3000)
      idx++
      const submittedCount = Number(await page.evaluate(e => e.querySelector('td:nth-of-type(4) > span').textContent, currentSurvey))
      
      console.log(submittedCount)
      
      if(limitedSubmitCount <= submittedCount) {
        await currentSurvey.click()
        await page.waitForSelector('global-wrapper-top-nav > div > nav:last-child >div > ul > li:nth-of-type(4)')
        const analyzeButton = await page.$('global-wrapper-top-nav > div > nav:last-child >div > ul > li:nth-of-type(4)');
        await analyzeButton.click();
        await page.waitForSelector('#dp-table') // table dom load 시까지 대기
        await page.waitFor(5000) // 엥귤러 이용한 ng-show 이므로 실제로 크롤러에서 해당 엘리먼트 랜더링되었는지 판단불가.
        const perticipantsList = await page.$$('#dp-table > tbody > tr');
        console.log(`load Participants`)
        console.log(perticipantsList.length)
      }
      await page.goto(mainLink)
      await page.waitFor(3000)
      await page.waitForSelector(`#left-panel`)
    }
    console.log(`${hospitalName} list load is completed`)

  }
}

startDocument()