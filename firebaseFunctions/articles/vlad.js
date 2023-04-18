
const functions = require("firebase-functions");
const admin = require("firebase-admin");
const db = admin.firestore();

const {BetaAnalyticsDataClient} = require('@google-analytics/data');

// exports.vlad = functions
// .region("europe-west1").https.onRequest((req, res) => {
//   try {
//     // Return a success response
//     res.status(200).send("Function ran successfully.");
//   } catch (err) {
//     // Return an error response
//     res.status(500).send("Function failed: " + err.message);
//   }
// });

// exports.vlad = functions
// .region("europe-west1").https.onCall(async (data, context) => {
  
//     return "yes"
// });

  /**
   * TODO(developer): Uncomment this variable and replace with your
   *   Google Analytics 4 property ID before running the sample.
   */

  // Imports the Google Analytics Data API client library.

  // Using a default constructor instructs the client to use the credentials
  // specified in GOOGLE_APPLICATION_CREDENTIALS environment variable.

  // Runs a simple report.




exports.vlad = functions.region("europe-west1").pubsub.schedule('20 19 * * 1').onRun( async (context) => {
    console.log('This wiMYsssVLAD!');
    const analyticsDataClient = new BetaAnalyticsDataClient();
    const propertyId = '252631605';
    // Add your code here to perform the desired action
    const [response] = await analyticsDataClient.runReport({
        property: `properties/${propertyId}`,
        dateRanges: [
          {
            startDate: '2022-03-31',
            endDate: 'today',
          },
        ],
        dimensions: [
          {
            name: 'city',
          },
        ],
        metrics: [
          {
            name: 'activeUsers',
          },
        ],
      });
  
      console.log('Report result:');
      response.rows.forEach(row => {
        console.log(row.dimensionValues[0], row.metricValues[0]);
      });
    return null;
  });




//   const analyticsreporting = google.analyticsreporting('v4');
  
//   const res = await analyticsreporting.reports.batchGet({
//       requestBody: {
//       reportRequests: [
//           {
//           viewId: '65704806',
//           dateRanges: [
//               {
//               startDate: '14daysAgo',
//               endDate: '7daysAgo',
//               },
//           ],
//           metrics: [
//               {
//               expression: 'ga:users',
//               },
//           ],
//           },
//       ],
//       },
//   });
//   console.log(res.data);
//   return res.data;
  
    