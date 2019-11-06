module.exports = async (credentials, webpush) => {
  const puppeteer = require("puppeteer");
  const fs = require("fs");
  const log = msg => {
    if (logging) console.log(msg);
  };
  const screenshot = (screen, path) => {
    if (screenshots) screen.screenshot({ path: `./screenshots/${path}.png` });
  };
  const escape = string => string.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");
  const printToFile = (file, data) =>
    new Promise((resolve, reject) => {
      fs.writeFile(file, data, "utf8", error => {
        if (error) {
          console.error(error);
          reject(false);
        } else {
          resolve(true);
        }
      });
    });

  let browser = await puppeteer.launch({
    headless: true,
    defaultViewport: null,
    args: [
      "--disable-dev-shm-usage"
      //'--disable-features=site-per-proces'
    ]
  });

  const logging = true;
  const screenshots = true;
  const repeat = true;
  let tries = 20;

  while (repeat) {
    try {
      await executeScript(browser, log, screenshot, printToFile, credentials);
    } catch (err) {
      log(err);
      if (err === '')
      webpush.sendNotification(credentials.subscription, payload).catch(err => console.error(err));
      tries--;
      if (!tries) {
        repeat = false;
      }
    }
  }
  return;
};

async function executeScript(browser, log, screenshot, printToFile, credentials) {
  log("Starting bot");
  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });

  await page.goto("https://colab.research.google.com", {
    waitUntil: "networkidle2"
  });

  await page.waitFor(2000);
  const loggedIn = await page.evaluate(() => document.querySelectorAll('[aria-label*="Google Account"]').length);
  if (!loggedIn) {
    // navigate to Login
    log("Navigate to Login");
    await page.waitForSelector("#gb > div > div > a");
    await page.waitFor(4000);
    await page.click("#gb > div > div > a");
    await page.waitFor(4000);
    screenshot(page, "1_Login");

    // Handle Login
    const remembered = await page.evaluate(() => document.querySelectorAll("#profileIdentifier").length);
    const login1 = await page.evaluate(() => document.querySelectorAll("#Email").length);
    const login2 = await page.evaluate(() => document.querySelectorAll("#identifierId").length);
    log("Handle Login");
    if (remembered) {
      await page.click("#gb > div > div > a");
    } else if (login1) {
      await page.type("#Email", credentials.user);
      await page.click("#next");
      await page.waitFor(2000);
      await page.type("#Passwd", credentials.password);
      await page.click("#signIn");
    } else if (login2) {
      await page.waitForSelector("#identifierId");
      await page.type("#identifierId", credentials.user);
      await page.click("#identifierNext > span");
      await page.waitFor(1000);
      await page.type('[type="password"]', credentials.password);
      await page.click("#passwordNext");
    }
    await page.waitFor(10000);
  }

  // check if modal exists
  log("Logged In");
  await page.evaluate(() => {
    if (document.querySelectorAll(".colab-open-dialog").length) {
      document.querySelector(".dismiss").click();
    }
  });
  screenshot(page, "2_Landing");
  await page.waitFor(1000);
  // navigate to last notebook
  log("Navigate to Notebook");
  await page.keyboard.down("Control");
  await page.keyboard.press("KeyO");
  await page.keyboard.up("Control");
  await page.waitForSelector("colab-dialog paper-tab:nth-of-type(3)");
  await page.click("colab-dialog paper-tab:nth-of-type(3)");
  await page.waitFor(3000);
  await page.click(".iron-selected #items > div:nth-of-type(1) a");

  // connect runtime
  screenshot(page, "3_Notebook");
  log("Connect Runtime");
  await page.waitForNavigation({ waitUntil: "networkidle2" });
  await page.click("colab-connect-button");

  // get selectors to iterate cells asynchronously
  log("Get cell Selectors");
  const cellListSelector = ".notebook-cell-list > div";
  const cellSelectors = await page.evaluate(cellListSelector => {
    return Array.from(document.querySelectorAll(cellListSelector)).map(
      (cell, index) => `${cellListSelector}:nth-child(${index + 1})`
    );
  }, cellListSelector);
  // iterate cells
  log("Iterate cells");
  let importDrive = true;
  for (let i = 0; i < cellSelectors.length; i++) {
    cellSelector = cellSelectors[i];
    if (importDrive) {
      screenshot(page, "4_Starting_cells");
      log("Import Drive");
      // access iframe
      let iframeElement = await page.$(".notebook-cell-list > .cell:first-child iframe");
      let iframe = null;
      let mounted = false;
      if (iframeElement) {
        log("Access iframe");
        iframe = await iframeElement.contentFrame();
        mounted = await iframe.evaluate(() => /mounted/.test(document.querySelector("body").textContent));
      }
      // never do that!!
      evilIf: if (!mounted) {
        // trigger cell after making sure no cell is running
        log("Making sure no cell is running");
        const runningCell = await page.evaluate(() => document.querySelector(".running, .pending"));
        if (runningCell) {
          await page.click(`${cellSelector} .cell-execution`);
          await page.waitFor(() => !document.querySelector(".running, .pending"), { timeout: 0 });
        }
        await page.click(`${cellSelector} .cell-execution`);
        await page.waitFor(10000);
        screenshot(page, "5_Starting_first_cell"); // access iframe
        if (!iframe) {
          log("Access iframe");
          iframeElement = await page.$(".notebook-cell-list > .cell:first-child iframe");
          iframe = await iframeElement.contentFrame();
        }
        if (await iframe.evaluate(() => /mounted/.test(document.querySelector("body").textContent))) {
          break evilIf;
        }
        // click link
        log("Click link to Drive validation.");
        screenshot(page, "6_before_link");
        await iframe.waitForSelector("a", { timeout: 30000 });
        await iframe.click("a");
        screenshot(page, "7_link_clicked");
        // get new tab
        log("Get new tab");
        await page.waitFor(5000);
        let pages = await browser.pages();
        // allow colab to mount drive
        log("Approve Drive Mount.");
        screenshot(pages[2], "8_mount_drive");
        await pages[2].click("#choose-account-0");
        await pages[2].waitFor(3000);
        screenshot(pages[2], "9_approve_mount");
        await pages[2].click("#submit_approve_access");
        await pages[2].waitFor(3000);
        screenshot(pages[2], "10_get_token");
        // get token
        log("Get the Token");
        const token = await pages[2].evaluate(() => document.querySelector("textarea").textContent);
        // pass token to iframe and submit form
        log("Submit form with Token");
        await iframe.type("input", token);
        await page.keyboard.press("Enter");
        await page.waitFor(() => !document.querySelector(".running, .pending"), { timeout: 0 });
        screenshot(page, "11_drive_mounted");
      }
      importDrive = false;
    } else if (i == cellSelectors.length - 2) {
      await page.click(`${cellSelector} .cell-execution`);
      // check every 15 minutes if model is either finnished or our runtime has been disconnected
      let finnished = false;
      while (!finnished) {
        await page.waitFor(900000);
        // get Logs from iframe and send push notification
        iframeElement = await page.$(`${cellSelector} iframe`);
        iframe = await iframeElement.contentFrame();
        let payload = { 
          title: 'Current log',
          message: log
        };
        webpush.sendNotification(credentials.subscription, payload).catch(err => console.error(err));
        let log = await iframe.evaluate(() => document.querySelector('#output-body').textContent);
        const disconnected = await page.evaluate(() => document.querySelectorAll("yes-no-dialog").length);
        const done = await page.evaluate(() => !document.querySelectorAll(".running, .pending").length);
        // if disconnect throw error to restart bot, if script is finished, go to next cell
        if (disconnected) {
          await page.click(".yes-no-dialog #cancel");
          payload = { 
            title: 'Disconnected, restarting now',
            message: log
          };
          webpush.sendNotification(credentials.subscription, payload).catch(err => console.error(err));
          throw "disconnected";
        }
        if (done) {
          finnished = true;
        }
      }
    } else {
      log(`Iterate Cells: ${i}`);
      screenshot(page, `11_run_cell_${i}`);
      await page.click(`${cellSelector} .cell-execution`);
      await page.waitFor(() => !document.querySelector(".running, .pending"), {
        timeout: 0
      });
    }
  }
}
