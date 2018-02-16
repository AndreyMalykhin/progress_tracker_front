import { ApolloCacheClient } from "apollo-link-state";
import gql from "graphql-tag";
import Type from "models/type";
import { MutationFunc } from "react-apollo/types";
import defaultId from "utils/default-id";

// tslint:disable-next-line:no-empty-interface
interface ICompleteIntroResponse {}

const completeIntroQuery = gql`
mutation CompleteIntro {
    completeIntro @client
}`;

function completeIntro(mutate: MutationFunc<ICompleteIntroResponse>) {
    return mutate({});
}

const completeIntroResolver = {
    resolvers: {
        Mutation: {
            completeIntro: (rootValue: any, args: any, { cache }: any) => {
                const data = {
                    settings: {
                        __typename: Type.Settings,
                        id: defaultId,
                        showIntro: false,
                    },
                };
                (cache as ApolloCacheClient).writeData({ data });
                return null;
            },
        },
    },
};

export {
    completeIntro,
    completeIntroQuery,
    completeIntroResolver,
    ICompleteIntroResponse,
};
