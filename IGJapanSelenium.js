require('dotenv').config();
const webdriver = require('selenium-webdriver');
require('chromedriver');


var By = webdriver.By;
var until = webdriver.until;

const URL = 'http://instagram.com/';
const ig_username = process.env.IG_USERNAME;
const ig_password = process.env.IG_PASSWORD;

async function getEnvVariable() {
    const env_variable = process.env.test;
    console.log(env_variable);
}

async function openCrawlerWeb() {
    var chromeCapabilities = webdriver.Capabilities.chrome();
    var chromeOptions = {'args': ['--test-type', '--incognito']};
    chromeCapabilities.set('chromeOptions', chromeOptions);
    let driver = await new webdriver.Builder().forBrowser("chrome").build();
    await driver.manage().window().setRect({ width: 1280, height: 800, x: 0, y: 0 });
    const web = URL;
    await driver.get(web);

    const ig_user_element = await driver.wait(until.elementLocated(By.xpath(`//*[@id="loginForm"]/div/div[1]/div/label/input`)));
    ig_user_element.sendKeys(ig_username);
    const ig_password_element = await driver.wait(until.elementLocated(By.xpath(`//*[@id="loginForm"]/div/div[2]/div/label/input`)));
    ig_password_element.sendKeys(ig_password);
    const login_element = await driver.wait(until.elementLocated(By.xpath(`//*[@id="loginForm"]/div/div[3]`)));
    login_element.click();
    // 中間碰到 6 code 驗證
    const wait_one = await driver.wait(until.elementLocated(By.xpath(`//*[@id="react-root"]/section/main/div/div/div/div/button`)));
    wait_one.click();
    const wait_two = await driver.wait(until.elementLocated(By.xpath(`/html/body/div[4]/div/div/div/div[3]/button[2]`)));
    wait_two.click();

    await driver.sleep(2000);

    var brandArray = [
        // 'mu_mumian',
        // 'lexus_jp',
        'qdymag'
    ]

    var brandArrayLength = brandArray.length;

    for (var i = 0; i < brandArrayLength; i++) {
        await getBrandInfo(driver, brandArray[i])
    }

    async function getBrandInfo(driver, brands) {
        var accountURL = `https://www.instagram.com/${brands}`;
        await driver.get(accountURL);
        await driver.sleep(1000);

        let igTraceNum = 0;
        const igTracePath = `//*[@id="react-root"]/section/main/div/header/section/ul/li[2]/a/span`;
        const igTraceEle = await driver.wait(until.elementLocated(By.xpath(igTracePath)));
        igTraceNum = await igTraceEle.getAttribute('title');
        console.log(`${brands} ` + igTraceNum);

        await driver.sleep(1000);
    }
    async function clickEachPost(driver) {

        var threeArray = 4;
        var lengtLine;

        for (var i = 1; i < threeArray; i++) {
            var igPostLine = `//*[@id="react-root"]/section/main/div/div[3]/article/div[1]/div/div[2]/div[${i}]/a/div/div[2]`;
            await openBatchbyBatch(igPostLine);
            await driver.sleep(1000);
        }

        async function openBatchbyBatch() {
            var igPostLineEle = await driver.wait(until.elementLocated(By.xpath(igPostLine)));
            igPostLineEle.click();
            await driver.sleep(1000);
            var igPostCloseBtn = `/html/body/div[5]/div[3]/button`;
            var igPostClose = await driver.wait(until.elementLocated(By.xpath(igPostCloseBtn)));
            await driver.sleep(1000);
            igPostClose.click();
            await driver.sleep(1000);
        }
    }

    await clickEachPost(driver);
}

async function getAccountInfo() {
    var accountURL = 'https://www.instagram.com/mu_mumian/';
    
}

async function main() {
    await getEnvVariable();
    await openCrawlerWeb();
    // await getAccountInfo();
}

// openCrawlerWeb();

main();