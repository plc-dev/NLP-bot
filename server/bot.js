module.exports = async credentials => {
    const puppeteer = require('puppeteer');
    const fs = require('fs');
    const escape = string => string.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    const printToFile = (file, data) => new Promise((resolve, reject) => {
        fs.writeFile(file, data, 'utf8', error => {
            if (error) {
                console.error(error);
                reject(false);
            } else {
                resolve(true);
            }
        });
    });

    const browser = await puppeteer.launch({
        headless: true,
        defaultViewport: null,
        args: [
            '--disable-dev-shm-usage',
            //'--disable-features=site-per-proces'
        ]
    });

    try {
        const page = await browser.newPage();
        await page.setViewport({ width: 1920, height: 1920 });

        await page.goto('https://colab.research.google.com', {
            waitUntil: 'networkidle2'
        });
        // navigate to Login
        await page.waitForSelector('#gb > div > div > a');
        await page.waitFor(4000);
        await page.click('#gb > div > div > a');
        await page.waitFor(4000);

        // Handle Login
        const remembered = await page.evaluate(() => document.querySelectorAll('#profileIdentifier').length);
        const login1 = await page.evaluate(() => document.querySelectorAll('#Email').length);
        const login2 = await page.evaluate(() => document.querySelectorAll('#identifierId').length);
        if (remembered) {
            await page.click('#gb > div > div > a');
        } else if (login1) {
            await page.type('#Email', credentials.user);
            await page.click('#next');
            await page.waitFor(2000);
            await page.type('#Passwd', credentials.password);
            await page.click('#signIn');
        } else if (login2) {
            await page.waitForSelector('#identifierId')
            await page.type('#identifierId', credentials.user);
            await page.click('#identifierNext > span');
            await page.waitFor(1000);
            await page.type('[type="password"]', credentials.password);
            await page.click('#passwordNext');
        }
        await page.waitFor(10000);

        // check if modal exists
        await page.evaluate(() => {
            if (document.querySelectorAll('.colab-open-dialog').length) {
                document.querySelector('.dismiss').click();
            }
        });
        await page.waitFor(1000);
        // navigate to last notebook
        await page.keyboard.down('Control');
        await page.keyboard.press('KeyO');
        await page.keyboard.up('Control');
        await page.waitFor(1000);
        await page.click('colab-dialog paper-tab:nth-of-type(3)');
        await page.waitFor(3000);
        await page.click('.iron-selected #items > div:nth-of-type(1) a');

        // connect runtime
        await page.waitForNavigation({ waitUntil: 'networkidle2' });
        await page.click('colab-connect-button');

        // get selectors to iterate cells asynchronously 
        const cellListSelector = '.notebook-cell-list > div';
        const cellSelectors = await page.evaluate(cellListSelector => {
            return Array.from(document.querySelectorAll(cellListSelector)).map((cell, index) => `${cellListSelector}:nth-child(${index + 1})`);
        }, cellListSelector);
        // iterate cells
        let importDrive = true;
        for (cellSelector of cellSelectors) {
            if (importDrive) {
                // trigger cell after making sure no cell is running
                await page.click(`${cellSelector} .cell-execution`);
                await page.waitFor(() => !document.querySelector('.running, .pending'), { timeout: 0 });
                await page.click(`${cellSelector} .cell-execution`);
                // access iframe containing link to allow drive
                const iframeElement = await page.$('#cell-wmjkFhrcWk99 > div.main-content > div.codecell-input-output > div.output > div.output-content > div.output-iframe-container > div > div > div > iframe');
                const iframe = await iframeElement.contentFrame();
                // click link 
                await iframe.waitForSelector('a', { timeout: 0 });
                await iframe.click('a');
                // get new tab
                await page.waitFor(5000);
                let pages = await browser.pages();
                // allow colab to mount drive
                await pages[2].click('#choose-account-0');
                await pages[2].waitFor(3000);
                await pages[2].click('#submit_approve_access');
                await pages[2].waitFor(3000);
                // get token
                const token = await pages[2].evaluate(() => document.querySelector('textarea').textContent);
                // pass token to iframe 
                await iframe.type('input', token);
                await page.keyboard.press('Enter');
                await page.waitFor(() => !document.querySelector('.running, .pending'), { timeout: 0 });
                importDrive = false;
            } else {
                await page.click(`${cellSelector} .cell-execution`);
                await page.waitFor(() => !document.querySelector('.running, .pending'), { timeout: 0 });
            }
        }

    } catch (err) {
        console.log(err);
    } finally {
        //await browser.close();
        return;
    }
};