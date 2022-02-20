const puppeteer = require('puppeteer')
const nodemailer = require('nodemailer')


const { loginAction } = require('./src/login')
const { getHospitalIds } = require('./src/extractorTarget')
const { mailService } = require('./src/mail')
const { excelGenerator } = require('./src/exel')
//https://www.penup.com/main/home
const mainLink = 'https://yonseipsychology.au1.qualtrics.com/Q/MyProjectsSection'
const windowWidth = 1920
const windowHeight = 1080

const startDocument = async () => {
  require('dotenv').config()
        
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
  
  const ret = []

  for(const [hospitalIndex, eachHospitalTagId]  of hospitalIds.entries()) {
    ret[hospitalIndex] = {
      name: '',
      survey: []
    }
    const currentHospitalInfo = ret[hospitalIndex];

    const targetItem = await page.$(`#${eachHospitalTagId}`);
    const hospitalName = (await page.evaluate(e => e.children[0].querySelector('div > span > div').textContent, targetItem)).trim();
    const jumpTag = await page.evaluateHandle(e => e.children[0], targetItem);

    currentHospitalInfo.name = hospitalName

    await jumpTag.click()
    await page.waitForSelector('#resource-list')
    // resource-list
    const surveyList = await page.$$('#resource-list > div:first-child > table > tbody > tr');
    const totalSurveyCount = surveyList.length;
    let idx = 0 
    const limitedSubmitCount = 5
    while(idx < totalSurveyCount) {
      
      await page.waitForSelector('#resource-list')
      
      const surveyList = await page.$$('#resource-list > div:first-child > table > tbody > tr');
      const currentSurvey = surveyList[idx]
      await page.waitFor(3000)
      
      const submittedCount = Number(await page.evaluate(e => e.querySelector('td:nth-of-type(4) > span').textContent, currentSurvey))
      const surveyName = (await page.evaluate(e => e.querySelector('td:nth-of-type(2) > span').textContent, currentSurvey)).trim()
      
      ret[hospitalIndex].survey[idx] = {
        info: {
          submittedCount,
          surveyName
        },
        participants: []
      }
      
      const currentSurveyInfo = currentHospitalInfo.survey[idx]
      console.log(`currentSurveyIndex is ${idx} submitCount ${submittedCount}`)
      idx++
      if(limitedSubmitCount <= submittedCount) {
        await currentSurvey.click()
        await page.waitForSelector('global-wrapper-top-nav > div > nav:last-child >div > ul > li:nth-of-type(4)')
        const analyzeButton = await page.$('global-wrapper-top-nav > div > nav:last-child >div > ul > li:nth-of-type(4)');
        await analyzeButton.click();
        await page.waitForSelector('#dp-table') // table dom load 시까지 대기
        await page.waitFor(5000) // 엥귤러 이용한 ng-show 이므로 실제로 크롤러에서 해당 엘리먼트 랜더링되었는지 판단불가.
        const questionList = await page.$$('#dp-table > thead > tr > th');
        // 'Recorded Date'
        // '근무' && '부서'
        // '상품권'
        let recordIdx = -1
        let deptIdx = -1
        let giftcardIdx = -1

        for(const [index, eachQuestion]  of questionList.entries()) {
          const parsedStr = (await page.evaluate(e => e.textContent, eachQuestion)).trim()
          let offSetIdx = index + 1
          if(parsedStr.includes('Recorded Date')) {
            recordIdx = offSetIdx
          }
          if(parsedStr.includes('근무') && parsedStr.includes('부서')) {
            deptIdx = offSetIdx
          }
          if(parsedStr.includes('상품권')) {
            giftcardIdx = offSetIdx
          }
        }
        console.log(`레코드 ${recordIdx} 근무 부서 ${deptIdx} 상품권 ${giftcardIdx}`)
        const perticipantsList = await page.$$('#dp-table > tbody > tr');
        for(const [participantsIndex, eachParticipants]  of perticipantsList.entries()) {
          const submitDate = (await page.evaluate((e, targetIdx) => e.querySelector(`td:nth-of-type(${targetIdx})`).textContent, eachParticipants, recordIdx)).trim()
          const departments = (await page.evaluate((e, targetIdx) => e.querySelector(`td:nth-of-type(${targetIdx})`).textContent, eachParticipants, deptIdx)).trim()
          const phoneNumber = (await page.evaluate((e, targetIdx) => e.querySelector(`td:nth-of-type(${targetIdx})`).textContent, eachParticipants, giftcardIdx)).trim()


          const deptStandard = [
            '내과 병동',
            '외과 병동',
            '내·외과 병동',
            '응급실',
            '중환자실',
            '수술실',
            '그 외 부서',
          ]

          const validPhonNumber = !!phoneNumber

          currentSurveyInfo.participants[participantsIndex] = {
            date: submitDate,
            success: validPhonNumber,
            errCode: []
          }
          !validPhonNumber && currentSurveyInfo.participants[participantsIndex].errCode.push('NO_PHONE_NUMBER')
        }
        console.log(`load Participants ${perticipantsList.length}`)
        console.log(JSON.stringify(ret))
      }
      await page.goto(mainLink)
      await page.waitFor(3000)
      await page.waitForSelector(`#left-panel`)
    }
    console.log(`${hospitalName} list load is completed`)
    
  }
  console.log(`Job Completed`)
  console.log(JSON.stringify(ret))
  // await excelGenerator(ret);
  //await mailService(``)
  await page.close()
  await browser.close();
}

startDocument()