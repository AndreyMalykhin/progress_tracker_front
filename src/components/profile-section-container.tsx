import ProfileSection, {
    IProfileSectionProps,
} from "components/profile-section";
import gql from "graphql-tag";
import { compose } from "react-apollo";
import graphql from "react-apollo/graphql";
import { RouteComponentProps, withRouter } from "react-router";
import myId from "utils/my-id";
import routes from "utils/routes";

interface IGetDataResponse {
    getUser: {
        name: string;
        rating: number;
        smallAvatarUrl: string;
    };
}

interface IRouteParams {
    id: string;
}

type IOwnProps = RouteComponentProps<IRouteParams>;

const getDataQuery = gql`
query GetDataQuery($userId: ID!) {
    getUser(id: $userId) {
        name
        rating
        smallAvatarUrl
    }
}`;

const withData = graphql<IGetDataResponse, IOwnProps, IProfileSectionProps>(
    getDataQuery,
    {
        options: (ownProps) => {
            return {
                variables: { userId: ownProps.match.params.id },
            };
        },
        props: ({ ownProps, data }) => {
            const { loading, getUser: user } = data!;

            if (loading) {
                return { loading };
            }

            const userId = ownProps.match.params.id;
            return {
                isMe: userId === myId,
                loading,
                onNewTrackableSelect: (trackableType) => {
                    ownProps.history.push(routes.trackableNew.path.replace(
                        ":type", trackableType.toString()));
                },
                onOpenProfileForm: () => null,
                onReportUser: (id) => null,
                onUpdateHeader: (state) => {
                    ownProps.history.replace({ state });
                },
                userId,
                userName: user.name,
                userRating: user.rating,
                userSmallAvatarUrl: user.smallAvatarUrl,
            } as IProfileSectionProps;
        },
    },
);

export default compose(withRouter, withData)(ProfileSection);
