const puppeteer = require('puppeteer');

(async() => {
    const browser = await puppeteer.launch({
        headless: true,
        ignoreHTTPSErrors: true,
        args: [`--window-size=1920,1080`],
        defaultViewport: {
          width:1920,
          height:1080
        }
    });
    const page = await browser.newPage();
    await page.goto('https://ramom.com.br');
    await delay(5000);
    await page.screenshot({path: 'ramomSemTempo.png'});
    await browser.close();
})();

function delay(time) {
    return new Promise(function(resolve) { 
        setTimeout(resolve, time)
    });
}