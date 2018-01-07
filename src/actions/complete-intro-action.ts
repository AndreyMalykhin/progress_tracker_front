import { ApolloCacheClient } from "apollo-link-state";
import gql from "graphql-tag";
import { MutationFunc } from "react-apollo/types";

// tslint:disable-next-line:no-empty-interface
interface ICompleteIntroResponse {}

const completeIntroQuery = gql`
mutation CompleteIntroMutation {
    completeIntro @client
}`;

function completeIntro(mutate: MutationFunc<ICompleteIntroResponse>) {
    return mutate({});
}

const completeIntroResolver = {
    resolvers: {
        Mutation: {
            completeIntro: (rootValue: any, args: any, { cache }: any) => {
                (cache as ApolloCacheClient).writeData({
                    data: {
                        settings: {
                            __typename: "Settings",
                            showIntro: false,
                        },
                    },
                });
                return null;
            },
        },
    },
};

export {
    completeIntro,
    ICompleteIntroResponse,
    completeIntroQuery,
    completeIntroResolver,
};
