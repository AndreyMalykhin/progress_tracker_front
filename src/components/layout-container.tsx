import Layout, { ILayoutProps } from "components/layout";
import gql from "graphql-tag";
import graphql from "react-apollo/graphql";

interface IGetLayoutDataResponse {
    settings: {
        showIntro: boolean;
    };
}

const getLayoutDataQuery = gql`
query GetLayoutData {
    settings @client {
        showIntro
    }
}`;

export default graphql<IGetLayoutDataResponse, {}, ILayoutProps>(
    getLayoutDataQuery,
    {
        props: ({ data }) => {
            return { showIntro: data!.settings.showIntro } as ILayoutProps;
        },
    },
)(Layout);
