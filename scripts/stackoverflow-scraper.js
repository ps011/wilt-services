const cheerio = require('cheerio');
const axios = require('axios');
const Wilt = require('../schemas/wilt.schema');
const fs = require('fs');
const mongoUtil = require('../utils/database');


async function extractQuestionLinks(questionsListPageLink) {
    console.log('Reading Link: ', questionsListPageLink);
    const questionLinks = [];
    let dom = await axios.get(questionsListPageLink);
    const $ = cheerio.load(dom.data);
    $('.question-hyperlink').each(function (index, element) {
        questionLinks.push($(element).attr('href'));
      });
      console.log('Retrieved complete list of questions, passing it on to process individual questions');
    return questionLinks.filter(q => q.startsWith('/'));
}

async function scrapeQuestion(questionAnswerPageLink) {
    console.log('Got a list of ', questionAnswerPageLink.length , 'questions');
    const result = [];
    for ([index, link] of questionAnswerPageLink.entries()) {
        console.log('Extracting information from question: ', index+1);
        let dom = await axios.get('https://stackoverflow.com' + link);
        const $ = cheerio.load(dom.data);
        const data = {
            category: 'TECH',
            tags: ['javascript', 'tech', ],
            userId: '5fd511f880ee1c0a22d0e571',
            username: 'wilt'
        }
        data.compact = $('#question-header').text().trim();
        data.lengthy = $('div[itemprop=acceptedAnswer] .answercell .js-post-body').html();
        result.push(data);
    };
    return result;
}

async function insertIntoDB(data) {
    fs.writeFileSync(process.cwd() + '/assets/records.json', JSON.stringify(data, null, 4))
    console.log('Fetched everything successfully. Inserting into DB');
    try {
        const db = await mongoUtil.connectToServer();
        const result = await Wilt.insertMany(data);
        console.log('Success!! Data pushed into DB', result.length, 'records');
    return result;
    } catch(e) {
        console.log('Failure!! Failed to push data into DB');        
    }
}

async function init() {
    for (let index = 0; index < 1; index++) {
        const data = await scrapeQuestion(await extractQuestionLinks(`https://stackoverflow.com/questions/tagged/javascript?tab=votes&page=${index+1}&pagesize=30`));
        const result = await insertIntoDB(data);
        console.log('Pushed', result.length, 'records in DB');
    }
    process.exit(1);
}

init();