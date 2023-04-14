const axios = require('axios');
const { DynamoDBClient, DeleteItemCommand, ScanCommand } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient } = require("@aws-sdk/lib-dynamodb");


const marshallOptions = {
  // Whether to automatically convert empty strings, blobs, and sets to `null`.
  convertEmptyValues: false, // false, by default.
  // Whether to remove undefined values while marshalling.
  removeUndefinedValues: false, // false, by default.
  // Whether to convert typeof object to map attribute.
  convertClassInstanceToMap: false, // false, by default.
};
const unmarshallOptions = {
  // Whether to return numbers as a string instead of converting them to native JavaScript numbers.
  wrapNumbers: false, // false, by default.
};


exports.handler = async (event) => {
  // pull new listings
  // create the local alreadyProcessedCache by taking all listings in the dynamo alreadyProcessedCache and flattening into just the line address, for easy searching

  const dbClient = new DynamoDBClient({ region: "us-west-2" });
  const translateConfig = { marshallOptions, unmarshallOptions };
  const dynamodb = DynamoDBDocumentClient.from(dbClient, translateConfig);

  // get listings we have already seen, so we can compare against the new ones

  const oldListings = [];
  const alreadyProcessedCache = [];

  const now = new Date();
  // const oneDayAgo = new Date(now.setDate(now.getDate() - 1));

  try {
    const res = await dynamodb.send(new ScanCommand({ TableName: `new-listings-cache` }))
    console.log('=== DYNAMODB RESPONSE ===', res);
    // sort old and new listings
    if (res.Count > 0) {
      res.Items.forEach((listing) => {
        // if the listing is older than 24 hours, delete it, otherwise add it to the local alreadyProcessedCache
        if ((new Date(listing.createdAt) < oneDayAgo)) {
          oldListings.push(listing);
        } else {
        // add only the listing's id
        alreadyProcessedCache.push(listing.id.S)
        }
      });
    }
  } catch (e) {
    return {
      statusCode: 500,
      body: JSON.stringify('Could not pull cached listings.'),
    };
  }

  console.log('=== HERE IS THE ALREADY PROCESSED CACHE ===', alreadyProcessedCache);

  if (oldListings.length > 0) {
    oldListings.forEach((async (_oldListing) => {
      await dynamodb.send(new DeleteItemCommand({
        TableName: `new-listings-cache-${event.detail.city}`,
        Key: { primaryKey: _oldListing.id }
      }))
    }))
  }

  const newListings = [];

  const options = {
    method: 'POST',
    url: 'PRUNED',
    headers: {
      'content-type': 'application/json',
      'Key': 'PRUNED',
      'Host': 'PRUNED'
    },
    data: `PRUNED`
  };

  // pull the last 10 listings in the selected city, and see if we have already seen them, if not then create an event

  try {
    const res = await axios(options);
    const recentListings = res.data.data

    recentListings.home_search.results.every(_listing => {
      if (alreadyProcessedCache.includes(_listing.source.listing_id)) {
        // listings are provided from newest to latest, so as soon as we get to a listing that is in the alreadyProcessedCache,
        // we know we have found all the new listings
        return false
      } else {
        // if listing id is not in alreadyProcessedCache, we haven't seen it, and it needs to be processed
        newListings.push(_listing)
        return true
      }
    });
    return newListings
  } catch (e) {
    console.log('Error processing recent listings.', e);
    return {
      statusCode: 500,
      body: JSON.stringify('Error processing recent listings.'),
    };
  }
}
;
