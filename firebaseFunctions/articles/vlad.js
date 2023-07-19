
const functions = require("firebase-functions");
const admin = require("firebase-admin");
const db = admin.firestore();
const propertyId = 

const {BetaAnalyticsDataClient} = require('@google-analytics/data');
const analyticsDataClient = new BetaAnalyticsDataClient();


// stored in articles_published collection per page
const perPageQueries = [
  // views per page with last 30days, last 30-60days, and last week
  {"dimensions":[{"name":"pagePath"}],"metrics":[{"name":"screenPageViews"}],"dateRanges":[{"startDate":"30daysAgo","endDate":"yesterday"},{"startDate":"60daysAgo","endDate":"30daysAgo"},{"startDate":"7daysAgo","endDate":"yesterday"}]},
  // user visits per page
  {"dimensions":[{"name":"pagePath"}],"metrics":[{"name":"screenPageViewsPerUser"}],"dateRanges":[{"startDate":"30daysAgo","endDate":"yesterday"},{"startDate":"60daysAgo","endDate":"30daysAgo"},{"startDate":"7daysAgo","endDate":"yesterday"}]},
  // user engagement duration per page
  {"dimensions":[{"name":"pagePath"}],"metrics":[{"name":"userEngagementDuration"}],"dateRanges":[{"startDate":"30daysAgo","endDate":"yesterday"},{"startDate":"60daysAgo","endDate":"30daysAgo"},{"startDate":"7daysAgo","endDate":"yesterday"}]},
  // conversions per page
  {"dimensions":[{"name":"pagePath"}],"metrics":[{"name":"conversions"}],"dateRanges":[{"startDate":"30daysAgo","endDate":"yesterday"},{"startDate":"60daysAgo","endDate":"30daysAgo"},{"startDate":"7daysAgo","endDate":"yesterday"}]}
]

// Currently unused as IDK where to store this data
// average engagement??? Is that total engagement time divided by active users or pages?
// Average engaged sessions per user??? total users or active user PER engagedSessions or userEngagementDuration?
const totalQueries = [
  // active users, now including weekly
  {"metrics":[{"name":"activeUsers"}],"dateRanges":[{"startDate":"30daysAgo","endDate":"yesterday"},{"startDate":"60daysAgo","endDate":"30daysAgo"},{"startDate":"7daysAgo","endDate":"yesterday"}]},
  // new users
  {"metrics":[{"name":"newUsers"}],"dateRanges":[{"startDate":"30daysAgo","endDate":"yesterday"},{"startDate":"60daysAgo","endDate":"30daysAgo"},{"startDate":"7daysAgo","endDate":"yesterday"}]},
  // all page views
  {"metrics":[{"name":"screenPageViews"}],"dateRanges":[{"startDate":"30daysAgo","endDate":"yesterday"},{"startDate":"60daysAgo","endDate":"30daysAgo"},{"startDate":"7daysAgo","endDate":"yesterday"}]},


  // These two might require different handling
  // all page views per language, language is a dimension and not a metric that we can query, so I took something very generic, to see the language demographics
  {"dimensions":[{"name":"language"}],"metrics":[{"name":"screenPageViews"}],"dateRanges":[{"startDate":"30daysAgo","endDate":"yesterday"},{"startDate":"60daysAgo","endDate":"30daysAgo"},{"startDate":"7daysAgo","endDate":"yesterday"}]},
  // all page views per country, same problem as with language demographics
  {"dimensions":[{"name":"country"}],"metrics":[{"name":"screenPageViews"}],"dateRanges":[{"startDate":"30daysAgo","endDate":"yesterday"},{"startDate":"60daysAgo","endDate":"30daysAgo"},{"startDate":"7daysAgo","endDate":"yesterday"}]}
]

async function getPublishedArticles(publishedArticlesRef) {
  const publishedArticlesSnapshot = await publishedArticlesRef.get()
  let articles = {}
  publishedArticlesSnapshot.forEach((doc) => {
    currentDoc = doc.data();
    // has to have the "/" at the start so that we can search it properly when we are checking the GA query results
    articles[`/${currentDoc.publishedFullPath}`] = currentDoc
  });
  return articles
}

function saveData(allStatistics, publishedArticlesRef) {
  for (var articleID in allStatistics){
    articleRef = publishedArticlesRef.doc(articleID)
    // I am not yet confident to run this yet :D
    // Also, it returns a promise, and do we want to wait for it or not?
    // I would guess not as then it at least speeds up the process, but then we might
    // want to avoid limits, and i dont think we are in a hurry to finish, except for the compute costs
    // articleRef.set(allStatistics[articleID], { merge: true });
  }
}

// The query returns only super vague values based on index of the time range
// This mapping is a pure assumption that the query we create will have
// last 30 days on the 1st position, time between 30 and 60 days on the 2nd,
// and last 7 days on the 3rd position. What happens if this is not the case? All of it falls apart.
function mapTimeRange(queryTimeRange) {
  switch (queryTimeRange) {
    case "date_range_0":
      return "30days"
    case "date_range_1":
      return "60days"
    case "date_range_2":
      return "7days"
    default:
      console.log("idk basically an error?");
      break;
  }
  return "idk what?!"
}

// Make sure that fields like articleID, "statistics", the query that is used exist before trying to assign it
// If we assign the timeRange right away, it will throw an error because the previous fields don't exist,
// so this makes sure they do exist before the assignment.
function fillMissingFields(articleStatistics, articleID, metricName) {
  if (!articleStatistics[articleID]) {
    articleStatistics[articleID] = {};
  }

  if (!articleStatistics[articleID]["statistics"]) {
    articleStatistics[articleID]["statistics"] = {};
  }

  if (!articleStatistics[articleID]["statistics"][metricName]) {
    articleStatistics[articleID]["statistics"][metricName] = {};
  }
  return articleStatistics
}

async function getDataFromQuery(query, articles) {
  const [response] = await analyticsDataClient.runReport({
    property: `properties/${propertyId}`,
    ...query
  });
  
  let articleStatistics = {}
  response.rows.forEach(row => {
    if (row.dimensionValues[0].value in articles) {
      const articleID = articles[row.dimensionValues[0].value].articleID
      const timeRange = mapTimeRange(row.dimensionValues[1].value)
      articleStatistics = fillMissingFields(articleStatistics, articleID, query["metrics"][0].name)
      // awful mapping, but what we want is to have an object with all the values we want to update.
      // We will be updating "statistics" field, each statistic has a name taken from the OG
      // query we used. Then each statistic has some time ranges to choose from.
      articleStatistics[articleID]["statistics"][query["metrics"][0].name][timeRange] = row.metricValues[0].value
    }
  });
  console.log("Article lenght:", Object.keys(articleStatistics).length); // just a debug log
  return articleStatistics
}

function getAllStatistics(articles) {
  let allStatistics = {}
  perPageQueries.forEach(query => {
    newStatistics = getDataFromQuery(query, articles)
    allStatistics = {
      ...allStatistics,
      ...newStatistics
    }
  });
  return allStatistics
}

exports.vlad = functions.region("europe-west1").pubsub.schedule('20 19 * * 1').onRun( async (context) => {
  const publishedArticlesRef = await db.collection("articles_published")
  const articles = await getPublishedArticles(publishedArticlesRef);
  const allStatistics = getAllStatistics(articles)
  saveData(allStatistics, publishedArticlesRef)
  return null;
});
