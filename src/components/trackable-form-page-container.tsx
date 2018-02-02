import Error from "components/error";
import Loader from "components/loader";
import TrackableFormPage, {
    ITrackable, ITrackableFormPageProps,
} from "components/trackable-form-page";
import gql from "graphql-tag";
import ProgressDisplayMode from "models/progress-display-mode";
import Type from "models/type";
import * as React from "react";
import { compose } from "react-apollo";
import graphql from "react-apollo/graphql";
import { QueryProps } from "react-apollo/types";
import { RouteComponentProps, withRouter } from "react-router";
import Difficulty from "utils/difficulty";
import myId from "utils/my-id";
import QueryStatus from "utils/query-status";
import withError from "utils/with-error";
import withLoader from "utils/with-loader";

interface IRouteParams {
    type?: Type;
    id?: string;
}

type IOwnProps = RouteComponentProps<IRouteParams> & {
    queryStatus?: QueryStatus;
};

interface IGetTrackableResponse {
    getTrackableById: {
        __typename: Type;
    };
}

interface IGetUserResponse {
    getUserById: {
        id: string;
        accessToken?: string;
    };
}

type ITrackableFormPageContainerProps = IOwnProps & {
    trackable: ITrackable;
    user: {
        accessToken?: string;
    }
};

const getTrackableQuery = gql`
query GetData($trackableId: ID!) {
    getTrackableById(id: $trackableId) {
        id
        isPublic
        ... on IPrimitiveTrackable {
            title
            iconName
        }
        ... on IGoal {
            difficulty
            deadlineDate
            progressDisplayMode
            maxProgress
        }
        ... on TaskGoal {
            tasks {
                id
                isDone
                title
            }
        }
    }
}`;

const withTrackable =
    graphql<IGetTrackableResponse, IOwnProps, ITrackableFormPageProps>(
        getTrackableQuery,
        {
            options: (ownProps) => {
                const { id: trackableId, type: trackableType } =
                    ownProps.match.params;
                return {
                    notifyOnNetworkStatusChange: true,
                    variables: { trackableId },
                };
            },
            props: ({ ownProps, data }) => {
                const { networkStatus: queryStatus, getTrackableById } = data!;

                if (queryStatus === QueryStatus.InitialLoading
                    || queryStatus === QueryStatus.Error
                ) {
                    return { queryStatus };
                }

                return { trackable: data!.getTrackableById };
            },
            skip: (ownProps) => !ownProps.match.params.id,
        },
    );

const getUserQuery = gql`
query GetUser($id: ID!) {
    getUserById(id: $id) {
        id
        accessToken
    }
}`;

const withUser = graphql<IGetUserResponse, IOwnProps, ITrackableFormPageProps>(
    getUserQuery,
    {
        options: (ownProps) => {
            return {
                notifyOnNetworkStatusChange: true,
                variables: { id: myId },
            };
        },
        props: ({ ownProps, data }) => {
            const { networkStatus: queryStatus, getUserById } = data!;

            if (queryStatus === QueryStatus.InitialLoading
                || queryStatus === QueryStatus.Error
                || ownProps.queryStatus === QueryStatus.InitialLoading
                || ownProps.queryStatus === QueryStatus.Error
            ) {
                return { queryStatus };
            }

            return { user: data!.getUserById, queryStatus };
        },
    },
);

class TrackableFormPageContainer extends
    React.Component<ITrackableFormPageContainerProps> {
    public render() {
        const { trackable, user, match, ...restProps } = this.props;
        const trackableType = match.params.type || trackable!.__typename;
        return (
            <TrackableFormPage
                isUserLoggedIn={!!user.accessToken}
                trackableType={trackableType}
                trackable={trackable}
            />
        );
    }
}

export default compose(
    withRouter,
    withTrackable,
    withUser,
    withLoader(Loader),
    withError(Error),
)(TrackableFormPageContainer);
