const puppeteer = require('puppeteer')
const fs = require('fs')
const axios = require('axios')
const imageType = require('image-type')
const { loginAction } = require('./src/login')
//https://www.penup.com/main/home
const mainLink = 'https://yonseipsychology.au1.qualtrics.com/Q/MyProjectsSection'
const windowWidth = 1920
const windowHeight = 1080

const startDocument = async () => {
 
  const browser = await puppeteer.launch({ 
    //userDataDir: './userData',
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
  const data = await page.$eval('[aria-label^="의료기관의 환자안전 및 직장"]')
  console.log(data)
  /*
  await pages.goto(penupLink)

  let imageList = []
 
  for(let scrollCount = 0; scrollCount < MAX_SCROLL; scrollCount++ ) {
    await pages.waitForSelector('.grid-item')
    const srcs = await pages.evaluate(() => {
      window.scrollTo(0,0)
      const imageList = []
      const delList = []
      const imageEls = document.querySelectorAll('.grid-item')
      imageEls && imageEls.forEach((eachEls) => {
        const currentImageLink = window.getComputedStyle(eachEls.querySelector(`.artwork-image`))['backgroundImage']
        if(currentImageLink && currentImageLink != 'none') {
          imageList.push(currentImageLink.match(/(?<=\(").+?(?="\))/)[0])
          delList.push(eachEls)
        }
      })
      // delete node 
      delList.forEach(eachEl => {
        eachEl.parentNode.removeChild(eachEl)
      })
      window.scrollBy(0,500)
      return imageList
    })
    imageList = imageList.concat(srcs)
  }
  console.log(imageList)
  imageList.forEach(async (eachUrl) => {
    const imgResult = await axios.get(eachUrl, {
      responseType: 'arraybuffer',
    });
    const { ext } = imageType(imgResult.data);
    fs.writeFileSync(`${folderName}/${Math.floor(new Date().getTime())}.${ext}`, imgResult.data);
  })
  await pages.close()
  await browser.close()
  */
}

startDocument()