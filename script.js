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

  const getLessonsLength = await browser.newPage();
  await getLessonsLength.goto(
    "https://lk.webheroschool.ru/teach/control/stream/tree"
  );
  let maxLessons = await getLessonsLength.evaluate(() => {
    return document.querySelectorAll(".dd-item").length;
  });

  const page2 = await browser.newPage();

  page2.setCookie(...cookies);

  //let content = JSON.parse(fs.readFileSync("lessons.json", "utf8"));

  await page2.goto(`https://lk.webheroschool.ru/teach/control/stream/tree`);
  let bar = new ProgressBar("[:bar] :percent :etas", { total: +maxLessons });
  bar.tick();

  let lessons = await page2.evaluate(() => {
    let lessonsList = {};

    document.querySelector(
      "body > div.gc-main-content.gc-both-main-content.wide.account-page-content.with-left-menu.gc-user-logined.gc-user-admin > div > div > div > div.row > div:nth-child(1) > div > ol > li:nth-child(2) > ol > li:nth-child(3) > ol > li:nth-child(1)"
    );
    document
      .querySelectorAll(
        "body > div.gc-main-content.gc-both-main-content.wide.account-page-content.with-left-menu.gc-user-logined.gc-user-admin > div > div > div > div.row > div:nth-child(1) > div > ol > li"
      )
      .forEach((level1) => {
        lessonsList[level1.dataset.id] = {
          title: level1.querySelector("span a").innerHTML,
          url: level1.querySelector("span a").href,
        };
       
          level1.querySelectorAll("ol > li").forEach((level2) => {
            lessonsList[level1.dataset.id][level2.dataset.id] = {
              title: level1.querySelector("span a").innerHTML,
              url: level1.querySelector("span a").href,
              level2: {
                title: level2.querySelector("span a").innerHTML,
                url: level2.querySelector("span a").href,
              },
            };
          
              level2.querySelectorAll("ol > li").forEach((level3) => {
                lessonsList[level1.dataset.id][level2.dataset.id][
                  level3.dataset.id
                ] = {
                  title: level1.querySelector("span a").innerHTML,
                  url: level1.querySelector("span a").href,
                  level2: {
                    title: level2.querySelector("span a").innerHTML,
                    url: level2.querySelector("span a").href,
                    level3: {
                      title: level3.querySelector("span a").innerHTML,
                      url: level3.querySelector("span a").href,
                    },
                  },
                };
              });
          });
      });

    return lessonsList;
  });

  await fs.writeFile(
    "lessons.json",
    JSON.stringify(lessons, null, 2),
    (err, data) => {
      if (err) process.exit();
    }
  );

  await browser.close();
})();
