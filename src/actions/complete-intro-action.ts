import { ApolloCacheClient } from "apollo-link-state";
import gql from "graphql-tag";
import Type from "models/type";
import { MutationFunc } from "react-apollo/types";
import myId from "utils/my-id";

// tslint:disable-next-line:no-empty-interface
interface ICompleteIntroResponse {
    completeIntro: {
        settings: {
            id: string;
            showIntro: boolean;
        };
    };
}

const completeIntroQuery = gql`
mutation CompleteIntro {
    completeIntro @client {
        settings {
            id
            showIntro
        }
    }
}`;

function completeIntro(mutate: MutationFunc<ICompleteIntroResponse>) {
    return mutate({});
}

const completeIntroResolver = {
    resolvers: {
        Mutation: {
            completeIntro: (rootValue: any, args: any, { cache }: any) => {
                return {
                    __typename: Type.CompleteIntroResponse,
                    settings: {
                        __typename: Type.Settings,
                        id: myId,
                        showIntro: false,
                    },
                };
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
