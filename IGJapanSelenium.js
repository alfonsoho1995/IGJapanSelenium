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
        'lexus_jp',
        // 'qdymag'
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
        await clickEachPost(driver);
    }

    async function clickEachPost(driver) {
        var threeArray = 3 + 1;
        var lengthLine = (3/3) + 1;
        // var lengthLine = (24/3) + 1; // total/3 >> start from 1 so add 1
        var count = 1;
        for (var j = 1; j < lengthLine; j++) {
            for (var i = 1; i < threeArray; i++) {
                var igPostLine = `//*[@id="react-root"]/section/main/div/div[3]/article/div[1]/div/div[${j}]/div[${i}]/a/div/div[2]`;
                var igPostURL = `//*[@id="react-root"]/section/main/div/div[3]/article/div[1]/div/div[1]/div[1]/a`;
                var igPostURLEle = await driver.wait(until.elementLocated(By.xpath(igPostURL)));
                var currentURL = await igPostURLEle.getAttribute('href');
                console.log(currentURL);
                await openBatchByBatch(igPostLine);
                await driver.sleep(1000);
                console.log(count++);
            }
        }

        async function openBatchByBatch() {
            var igPostLineEle = await driver.wait(until.elementLocated(By.xpath(igPostLine)));
            igPostLineEle.click();
            await driver.sleep(2000);
            await getContentsEachPost(driver);
            await driver.sleep(1000);
            var igPostCloseBtn = `/html/body/div[5]/div[3]/button`;
            var igPostClose = await driver.wait(until.elementLocated(By.xpath(igPostCloseBtn)));
            await driver.sleep(1000);
            igPostClose.click();
            await driver.sleep(1000);
        }
    
        async function getContentsEachPost() {
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
            await driver.findElements(By.xpath('//a[@class=" xil3i"]')).then(function(elements){
                for (var i = 0; i < elements.length; i++){
                    elements[i].getText().then(function(tags){
                        console.log(tags);
                    });
                };
            });
            // fetch each post hashtags
            // fetch each post likes
            await driver.findElements(By.xpath('/html/body/div[5]/div[2]/div/article/div[3]/section[2]/div/div/a/span')).then(function(elements){
                for (var i = 0; i < elements.length; i++){
                    elements[i].getText().then(function(likes){
                        console.log(likes);
                    });
                };
            });
            // fetch each post likes
            // fetch each post post time
            var dateObjPath = "/html/body/div[5]/div[2]/div/article/div[3]/div[1]/ul/div/li/div/div/div[2]/div/div/time";
            var dateObjEle = await driver.findElement(By.xpath(dateObjPath));
            console.log(await dateObjEle.getAttribute('datetime'));
            // fetch each post post time
        }
    }

    
}

async function main() {
    await getEnvVariable();
    await openCrawlerWeb();
}

main();