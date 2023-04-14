# Listing searcher: Serverless, expandable, and fault tolerant.

Scans user selected cities for new real estate listings. New real estate listings are then sent to a database where a user can query the new listings to accomplish business goals with this data.

## How it works
An Eventbridge schedule emits an event every 15 minutes (can be virtually any cron expression) that triggers this state machine which then does ETL type work. Steps inside of this
state machine are prioritized to be native integrations (versus lambda with SDK package for DynamoDb etc) where it makes sense, to improve performance. 

## Caveats

Things that could be improved upon:

- Error handling could be improved upon, currently if a step fails there are only retries available. Future versions could include step branching to better handle errors.
- GraphQL in the backend is an anti-pattern, and we should be connecting directly to a database without the GraphQL layer.
- Lambdas could be probably be split more to only handle single tasks, to really drill down on error handling and avoid making repeat requests.

## Things that would be good features for the future:

- User notification for when a new listing is found, would just need to add an additional step to send an email using the SES or SNS SDK or other 3rd party email provider.
- A step that checks whether to process or ignore the listing, based on if the agent of the house is already a customer, or has requested not to be contacted.
- A better system that automatically updates the lambdas when a new commit is added to the repo.

Thanks for looking!
