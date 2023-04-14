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

- A leaderboard for seeing who has saved the most miles
- A fraud detection engine to look for users gaming the system
- Probably an entire different architecture to support serverless / event drive functionality

Thanks for looking!
