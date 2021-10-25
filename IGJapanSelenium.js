require('dotenv').config();
const webdriver = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
require('chromedriver');
const path = require('path');

var fs = require('fs');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;


var By = webdriver.By;
var until = webdriver.until;

const URL = 'http://instagram.com/';
const igUsername = process.env.IG_USERNAME;
const igPassword = process.env.IG_PASSWORD;

async function getEnvVariable() {
    const envVariable = process.env.test;
    console.log(envVariable);
}

async function setChromeDriver() {
    const chromeDriverPath = "./chromedriver";
    const service = new chrome.ServiceBuilder(path.join(__dirname, chromeDriverPath)).build();
    await openCrawlerWeb(service);
}

async function openCrawlerWeb(service) {
    chrome.setDefaultService(service);
    console.log("reset chrome driver 90");
    var chromeCapabilities = webdriver.Capabilities.chrome();
    var chromeOptions = {'args': ['--test-type', '--incognito']};
    chromeCapabilities.set('chromeOptions', chromeOptions);
    let driver = await new webdriver.Builder().forBrowser("chrome").build();
    await driver.manage().window().setRect({ width: 1280, height: 800, x: 0, y: 0 });
    const web = URL;
    await driver.get(web);

    const igUserEle = await driver.wait(until.elementLocated(By.xpath(`//*[@id="loginForm"]/div/div[1]/div/label/input`)));
    igUserEle.sendKeys(igUsername);
    const igPasswordEle = await driver.wait(until.elementLocated(By.xpath(`//*[@id="loginForm"]/div/div[2]/div/label/input`)));
    igPasswordEle.sendKeys(igPassword);
    const loginEle = await driver.wait(until.elementLocated(By.xpath(`//*[@id="loginForm"]/div/div[3]`)));
    loginEle.click();

    // 中間碰到 6 code 驗證
    const waitOneClose = await driver.wait(until.elementLocated(By.xpath(`//*[@id="react-root"]/div/div/section/main/div/div/div/div/button`)));
    waitOneClose.click();
    const waitTwoClose = await driver.wait(until.elementLocated(By.xpath(`/html/body/div[5]/div/div/div/div[3]/button[2]`)));
    waitTwoClose.click();

    await driver.sleep(2000);

    var brandArray = [
        // 'mu_mumian',
        'lexus_jp',
        // 'qdymag'
    ]

    var brandArrayLength = brandArray.length;

    // function sleep(ms) {
    //     return new Promise(resolve => setTimeout(resolve, ms));
    // }

    for (var i = 0; i < brandArrayLength; i++) {
        await getBrandInfo(driver, brandArray[i])
    }

    async function getBrandInfo(driver, brands) {
        var accountURL = `https://www.instagram.com/${brands}`;
        await driver.get(accountURL);
        await driver.sleep(1000);

        let igTraceNum = 0;
        const igTracePath = `//*[@id="react-root"]/div/div/section/main/div/header/section/ul/li[2]/a/span`;
        const igTraceEle = await driver.wait(until.elementLocated(By.xpath(igTracePath)));
        igTraceNum = await igTraceEle.getAttribute('title');
        console.log(`${brands} ` + igTraceNum);

        await driver.sleep(1000);
        await clickEachPost(driver);
    }

    async function clickEachPost(driver) {

        var threeArray = 3 + 1;
        var lengthLine = (6/3) + 1;
        // var lengthLine = (24/3) + 1; // total/3 >> start from 1 so add 1
        var count = 1;
        for (var j = 1; j < lengthLine; j++) {
            for (var i = 1; i < threeArray; i++) {
                // new
                // 直行6
                // `//*[@id="react-root"]/div/div/section/main/div/div[4]/article/div[1]/div/div/div[1]`
                // 直行6
                // 橫列3
                // `//*[@id="react-root"]/div/div/section/main/div/div[4]/article/div[1]/div/div[1]`
                // 橫列3
                // `//*[@id="react-root"]/div/div/section/main/div/div[4]/article/div[1]/div/div[j]/div[i]`
                // j 是橫列 i 是直行

                // //*[@id="react-root"]/div/div/section/main/div/div[3]/article/div[1]/div/div[2]/div[1] 中間的 div[4] 不對要是 [3]
                var igPostLine = `//*[@id="react-root"]/div/div/section/main/div/div[3]/article/div[1]/div/div[${j}]/div[${i}]`;
                await openBatchByBatch(igPostLine, j, i);
                await driver.sleep(1000);

                console.log(count++);
            }
        }

        async function openBatchByBatch(igPostLine, j, i) {
            var igPostLineEle = await driver.wait(until.elementLocated(By.xpath(igPostLine)));
            igPostLineEle.click();
            await driver.sleep(2000);
            await getContentsEachPost(driver, j, i);
            await driver.sleep(1000);
            var igPostCloseBtn = `/html/body/div[6]/div[3]/button`;
            var igPostClose = await driver.wait(until.elementLocated(By.xpath(igPostCloseBtn)));
            await driver.sleep(1000);
            igPostClose.click();
            await driver.sleep(1000);
        }
    
        async function getContentsEachPost(driver, j, i) {

            // fetch each post post time
            var dateObjPath = "/html/body/div[6]/div[2]/div/article/div/div[2]/div/div[2]/div[2]/a/time";
            var dateObjEle = await driver.findElement(By.xpath(dateObjPath));
            var postTime = await dateObjEle.getAttribute('datetime');
            console.log(postTime);
            // fetch each post post time
            
            // fetch each post content
            // await driver.findElements(By.xpath('//div[@class="C4VMK"]')).then(function(elements){
            //     for (var i = 0; i < elements.length; i++){
            //         elements[i].getText().then(function(text){
            //             console.log(text);
            //         });
            //     };
            // });
            // fetch each post content

            // fetch each post hashtags
            // will miss the last one hashtag
            async function getHashtags() {
                var getHashtagsMethod = await driver.findElements(By.xpath('//a[@class=" xil3i"]')).then(async function(elements){
                    async function forLoop() {
                        var hashtagsArray = [];
                        for (var i = 0; i < elements.length; i++){
                            await driver.sleep(100);
                            elements[i].getText().then(async function(tags){
                                await hashtagsArray.push(tags);
                            });
                        };
                        return hashtagsArray; 
                    }
                    return await forLoop();
                });
                return await getHashtagsMethod;
            }

            var hashtagsAll = await getHashtags();
            var writeStream = fs.createWriteStream(`hashtagsAll_${postTime}.csv`);
            writeStream.write("hashtagsAll" + "\n");
            // writeStream.write("hashtagsAll" + ',' + '\n');
            for (var l = 0; l < hashtagsAll.length; l++) {
                // writeStream.write(hashtagsAll[l] + ',' + '\n');
                writeStream.write(hashtagsAll[l] + "\n");
            }
            
            // fetch each post hashtags

            // fetch each post likes
            await driver.findElements(By.xpath('/html/body/div[6]/div[2]/div/article/div/div[2]/div/div[2]/section[2]/div/div/a/span')).then(function(elements){
                for (var i = 0; i < elements.length; i++){
                    elements[i].getText().then(function(likes){
                        console.log(likes);
                    });
                };
            });
            // fetch each post likes

            
        }
    }

    
}

async function main() {
    await getEnvVariable();
    await setChromeDriver();
    // await openCrawlerWeb();
}

main();