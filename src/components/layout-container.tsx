import Layout, { ILayoutProps } from "components/layout";
import gql from "graphql-tag";
import graphql from "react-apollo/graphql";

interface IGetDataResponse {
    settings: {
        id: string;
        showIntro: boolean;
    };
}

const getDataQuery = gql`
query GetData {
    settings @client {
        id
        showIntro
    }
}`;

export default graphql<IGetDataResponse, {}, ILayoutProps>(
    getDataQuery,
    {
        props: ({ data }) => {
            return { showIntro: data!.settings.showIntro };
        },
    },
)(Layout);
