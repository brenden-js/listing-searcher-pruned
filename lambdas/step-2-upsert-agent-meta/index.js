const { ApolloClient, gql, HttpLink, InMemoryCache } = require("@apollo/client/core");
const fetch = require("cross-fetch");


const UPSERT_AGENT = gql`
    mutation UpsertAgentMeta(
        $name: String!
        $phone: String
        $email: String
        $license: String
        $broker: String
        $brokerLicense: String
        $token: String!
    ) {
        upsertAgentMeta(
            name: $name
            phone: $phone
            email: $email
            license: $license
            broker: $broker
            brokerLicense: $brokerLicense
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

  const seller = event.advertisers.find((_advertiser) => _advertiser.type === 'seller');

  const res = await client.mutate({
    mutation: UPSERT_AGENT,
    variables: {
      name: seller.name,
      phone: seller.phone ? seller.phone : null,
      email: seller.email ? seller.email : null,
      license: seller.fulfillment_id ? seller.fulfillment_id : 'UNKNOWN',
      broker: event.branding[0].name ? event.branding[0].name : 'UNKNOWN',
      brokerLicense: event.branding[0].name ? event.branding[0].name : 'UNKNOWN',
      token: process.env.GQL_TOKEN
    }
  })

  console.log("GQL RESPONSE", res);

  if (res.errors > 0) {
    throw new Error('Graphql request failed for some reason.')
  }

  return { agentMetaId: res.data.upsertAgentMeta.id, ...event }
}
;
