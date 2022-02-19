const loginAction = async (page) => {
    const exists = await page.evaluate(() => {
        const findLoginContainer = document.getElementsByClassName('login_container all_centered_flex')
        return findLoginContainer.length !== 0
    })

    
    if(exists) {
        // loginSeq
        console.log(`No Session Need to Login`)

        require('dotenv').config()
        console.log(process.env)
        await page.type("#UserName", process.env.EMAIL)
        await page.type("#UserPassword", process.env.PASSWORD)
        await page.$eval('#loginButton', btn => btn.click() );
    } else {
        console.log(`Login session is alived`)
    }
    await page.waitForSelector(`#left-panel`)
    console.log(`Project load Compeleted`)
}

exports.loginAction = loginAction;