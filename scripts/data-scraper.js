const cheerio = require("cheerio");
const axios = require("axios");
const Wilt = require("../schemas/wilt.schema");
const mongoUtil = require("../utils/database");
var url = require('url');

async function extractQuestionLinks(questionsListPageLink) {
  console.log("Reading Link: ", questionsListPageLink);
  const questionLinks = [];
  let dom;
  try {
    dom = await axios.get(questionsListPageLink);
  } catch (error) {
      console.log('Error Occured', error);
      process.exit(1)
  }
  const $ = cheerio.load(dom.data);
  $(".question-hyperlink").each(function (index, element) {
    questionLinks.push($(element).attr("href"));
  });
  console.log(
    "Retrieved complete list of questions, passing it on to process individual questions"
  );
  return questionLinks.filter((q) => q.startsWith("/"));
}

async function scrapeQuestion(questionAnswerPageLink, category, baseUrl) {
  console.log("Got a list of ", questionAnswerPageLink.length, "questions from ", baseUrl);
  const result = [];
  for ([index, link] of questionAnswerPageLink.entries()) {
    // if (index < 2) {
      console.log("Extracting information from question: ", index + 1);
      let dom;
      try {
        console.log("Extracting information from question: ", baseUrl + link);
        dom = await axios.get(baseUrl + link);
      } catch (error) {
        console.log('Error Occured', error);
        process.exit(1)
      }
      const $ = cheerio.load(dom.data);
      const data = {
        category,
        tags: [],
        userId: "5fd511f880ee1c0a22d0e571",
        username: "wilt",
      };
      data.compact = $("#question-header").text().trim();
      data.lengthy = $(
        "div[itemprop=acceptedAnswer] .answercell .js-post-body"
      ).html();
      $(".post-taglist .grid a").each((index, element) => {
        data.tags.push($(element).text());
      });
      result.push(data);
    // }
  }
  return result;
}

async function insertIntoDB(data) {
  console.log("Fetched everything successfully. Inserting into DB");
  try {
    const db = await mongoUtil.connectToServer();
    const result = await Wilt.insertMany(data);
    console.log("Success!! Data pushed into DB", result.length, "records");
    return result;
  } catch (e) {
    console.log("Failure!! Failed to push data into DB");
  }
}

async function init(ar) {
  for (let index = 0; index < ar[3]; index++) {
    const data = await scrapeQuestion(
      await extractQuestionLinks(
        `${ar[4]}?page=${
          index + 1
        }&pagesize=30`
      ),
      ar[2],
      url.parse(ar[4]).protocol + '//' + url.parse(ar[4]).host
    );
    const result = await insertIntoDB(data);
    console.log("Pushed", result.length, "records in DB");
  }
  process.exit(0);
}

init(process.argv);

// USAGE -> node data-scraper.js CATEGORY #ofPagesToScrape URL