const { CONSTANTS } = require("./common");

const surveyParse = async (page, hospitalIds) => {
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
      await page.waitForSelector(CONSTANTS.LABEL_SLECTOR.SURVEY_LIST_PARENT)
      // resource-list
      const surveyList = await page.$$(CONSTANTS.LABEL_SLECTOR.SURVEY_LIST);
      const totalSurveyCount = surveyList.length;
      let idx = 0 

      while(idx < totalSurveyCount) {
        
        await page.waitForSelector(CONSTANTS.LABEL_SLECTOR.SURVEY_LIST_PARENT)
        
        const surveyList = await page.$$(CONSTANTS.LABEL_SLECTOR.SURVEY_LIST);
        const currentSurvey = surveyList[idx]
        await page.waitFor(3000)
        
        const submittedCount = Number(await page.evaluate((e, query) => e.querySelector(query).textContent, currentSurvey, CONSTANTS.LABEL_SLECTOR.SURVEY_RESPONSE_COUNT))
        const surveyName = (await page.evaluate((e, query) => e.querySelector(query).textContent, currentSurvey, CONSTANTS.LABEL_SLECTOR.SURVEY_RESPONSE_NAME)).trim()
        
        currentHospitalInfo.survey[idx] = {
          submittedCount,
          surveyName,
          enoughParticipants: false,
          participants: []
        }
        
        const currentSurveyInfo = currentHospitalInfo.survey[idx]
        console.log(`currentSurveyIndex is ${idx} submitCount ${submittedCount}`)
        idx++
        if(CONSTANTS.RESPONSE_FILTER_COUNT <= submittedCount) {
            currentSurveyInfo.enoughParticipants = true
            await currentSurvey.click()
            await page.waitForSelector(CONSTANTS.LABEL_SLECTOR.DATA_ANAL_WAIT)
            const analyzeButton = await page.$(CONSTANTS.LABEL_SLECTOR.DATA_ANAL_CLICK);
            await analyzeButton.click();
            await page.waitForSelector(CONSTANTS.LABEL_SLECTOR.PARTICIPANTS_TABLE) // table dom load 시까지 대기
            await page.waitFor(5000) // 엥귤러 이용한 ng-show 이므로 실제로 크롤러에서 해당 엘리먼트 랜더링되었는지 판단불가.
            const questionList = await page.$$(CONSTANTS.LABEL_SLECTOR.PARTICIPANTS_LIST);
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
            
              const validPhonNumber = !!phoneNumber
            
              currentSurveyInfo.participants[participantsIndex] = {
                date: submitDate,
                success: validPhonNumber,
                cellNum: phoneNumber,
                dept: departments,
                errCode: []
              }
              !validPhonNumber && currentSurveyInfo.participants[participantsIndex].errCode.push('NO_PHONE_NUMBER')
            }
            console.log(`load Participants ${perticipantsList.length}`)
            await page.goto(CONSTANTS.MAIN_LINK)
            await page.waitFor(3000)
            await page.waitForSelector(`#left-panel`)
        }
      }
      console.log(`${hospitalName} list load is completed`)
    }
    console.log(JSON.stringify(ret))
          
    return ret
}

exports.surveyParse = surveyParse