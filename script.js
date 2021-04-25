const puppeteer = require("puppeteer");
const fs = require("fs");
const ProgressBar = require("progress");

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  await page.goto("https://lk.webheroschool.ru/cms/system/login");

  await page.evaluate(() => {
    const authData = {
      username: "",
      password: "",
    };
    document.querySelector(
      "#xdget602131_1 > div > div.field-input-block > input"
    ).value = authData.username;
    document.querySelector(
      "#xdget478769_1 > div > div.field-input-block > input"
    ).value = authData.password;
    document.querySelector("#xdget593268_1").click();
  });

  const cookies = await page.cookies();

  const getUserPages = await browser.newPage();
  await getUserPages.goto(
    "https://lk.webheroschool.ru/pl/user/user/index?page=99999999&per-page=30"
  );
  let maxPage = await getUserPages.evaluate(() => {
    return document.querySelector(
      "#w7 > div > div.panel-footer > div.kv-panel-pager > ul > li.active > a"
    ).innerHTML;
  });

  const page2 = await browser.newPage();

  page2.setCookie(...cookies);

  let content = JSON.parse(fs.readFileSync("user.json", "utf8"));
  let bar = new ProgressBar("[:bar] :percent :etas", { total: +maxPage });

  for (let i = 1; i <= maxPage; i++) {
    bar.tick();

    await page2.goto(
      `https://lk.webheroschool.ru/pl/user/user/index?page=${i}&per-page=30`
    );

    let usersInfo = await page2.evaluate(() => {
      let pageUserObject = {
        users: [],
      };
      document
        .querySelectorAll("#w7-container > table > tbody > tr")
        .forEach((item) => {
          pageUserObject["users"].push({
            name: item.querySelector("td.user-name > a").innerHTML,
            url: item.querySelector("td.user-name > a").href,
            email: item.querySelector("td:nth-child(3) > a > div").innerText,
            role: item.querySelector("td:nth-child(4)").innerHTML,
          });
        });
      return pageUserObject;
    });
    content[i] = usersInfo.users;

    await fs.writeFile(
      "user.json",
      JSON.stringify(content, null, 2),
      (err, data) => {
        if (err) process.exit();
      }
    );
  }

  await browser.close();
})();
