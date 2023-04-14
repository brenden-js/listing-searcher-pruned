const { ApolloClient, gql, HttpLink, InMemoryCache } = require("@apollo/client/core");
const fetch = require("cross-fetch");


const CREATE_HOUSE = gql`
    mutation CreateQuoteForNewListing(
        $stAddress: String!,
        $city: String!,
        $zipCode: Int!,
        $state: String!,
        $sqft: Int!,
        $agentMetaId: String!,
        $token: String!,
    ) {
        createQuoteForNewListing(
            stAddress: $stAddress
            city: $city
            zipCode: $zipCode
            state: $state
            sqft: $sqft
            agentMetaId: $agentMetaId
            token: $token
        ) {
            id
        }
    }
`;

exports.handler = async (event) => {
  console.log(' ==== EVENT BEING PASSED IN ====', event)

  const client = new ApolloClient({
    link: new HttpLink({ uri: process.env.PRODUCTION_GRAPHQL_URL, fetch }),
    cache: new InMemoryCache(),
  });

  const res = await client.mutate({
    mutation: CREATE_HOUSE,
    variables: {
      stAddress: event.location.address.line,
      city: event.location.address.city,
      zipCode: parseInt(event.location.address.postal_code),
      state: event.location.address.state,
      sqft: event.description.sqft,
      agentMetaId: event.agentMetaId,
      lat: event.location.address.coordinate.lat ? event.location.address.coordinate.lat : null,
      lng: event.location.address.coordinate.lon ? event.location.address.coordinate.lon : null,
      token: process.env.GQL_TOKEN
    }
  })

  console.log("GQL RESPONSE", res);

  if (res.errors > 0) {
    throw new Error('Graphql request failed for some reason.')
  }

  return {...event, houseId: res.id}
}
;
