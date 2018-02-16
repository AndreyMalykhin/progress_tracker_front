import Error from "components/error";
import Loader from "components/loader";
import TrackableFormPage, {
    ITrackable, ITrackableFormPageProps,
} from "components/trackable-form-page";
import withError from "components/with-error";
import withLoader from "components/with-loader";
import withSession, { IWithSessionProps } from "components/with-session";
import gql from "graphql-tag";
import Difficulty from "models/difficulty";
import ProgressDisplayMode from "models/progress-display-mode";
import Type from "models/type";
import * as React from "react";
import { compose } from "react-apollo";
import graphql from "react-apollo/graphql";
import { QueryProps } from "react-apollo/types";
import { RouteComponentProps, withRouter } from "react-router";
import QueryStatus from "utils/query-status";

interface ITrackableFormPageContainerProps extends
    IOwnProps, IWithSessionProps {
    trackable: ITrackable;
}

interface IOwnProps extends RouteComponentProps<IRouteParams> {}

interface IRouteParams {
    type?: Type;
    id?: string;
}

interface IGetTrackableResponse {
    getTrackableById: {
        __typename: Type;
    };
}

const getDataQuery = gql`
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

const withData =
    graphql<IGetTrackableResponse, IOwnProps, ITrackableFormPageProps>(
        getDataQuery,
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

class TrackableFormPageContainer extends
    React.Component<ITrackableFormPageContainerProps> {
    public render() {
        const { trackable, session, match, ...restProps } = this.props;
        const trackableType = match.params.type || trackable!.__typename;
        return (
            <TrackableFormPage
                isUserLoggedIn={session.accessToken != null}
                trackableType={trackableType}
                trackable={trackable}
            />
        );
    }
}

export default compose(
    withRouter,
    withSession,
    withData,
    withLoader(Loader),
    withError(Error),
)(TrackableFormPageContainer);
