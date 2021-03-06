import Error from "components/error";
import Loader from "components/loader";
import TrackableFormPage, {
    ITrackable, ITrackableFormPageProps,
} from "components/trackable-form-page";
import withError from "components/with-error";
import withLoader from "components/with-loader";
import withNetworkStatus, {
    IWithNetworkStatusProps,
} from "components/with-network-status";
import withSession, { IWithSessionProps } from "components/with-session";
import withSyncStatus from "components/with-sync-status";
import gql from "graphql-tag";
import Difficulty from "models/difficulty";
import ProgressDisplayMode from "models/progress-display-mode";
import TrackableType from "models/trackable-type";
import Type from "models/type";
import * as React from "react";
import { compose } from "react-apollo";
import graphql from "react-apollo/graphql";
import { QueryProps } from "react-apollo/types";
import { RouteComponentProps, withRouter } from "react-router";
import QueryStatus from "utils/query-status";

interface ITrackableFormPageContainerProps extends
    IOwnProps, IWithSessionProps, IWithNetworkStatusProps {
    data?: QueryProps & IGetDataResponse;
}

interface IOwnProps extends RouteComponentProps<IRouteParams> {}

interface IRouteParams {
    type?: TrackableType;
    id?: string;
}

interface IGetDataResponse {
    getTrackable: ITrackable;
}

const getDataQuery = gql`
query GetData($trackableId: ID!) {
    getTrackable(id: $trackableId) {
        id
        isPublic
        title
        ... on IPrimitiveTrackable {
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
    graphql<IGetDataResponse, IOwnProps, ITrackableFormPageContainerProps>(
        getDataQuery,
        {
            options: (ownProps) => {
                const { id: trackableId, type: trackableType } =
                    ownProps.match.params;
                return {
                    fetchPolicy: "cache-only",
                    variables: { trackableId },
                };
            },
            skip: (ownProps) => !ownProps.match.params.id,
        },
    );

class TrackableFormPageContainer extends
    React.Component<ITrackableFormPageContainerProps> {
    public render() {
        const { data, session, match, ...restProps } = this.props;
        const trackable = data && data.getTrackable;
        const trackableType = match.params.type
            || trackable!.__typename as TrackableType;
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
    withLoader<ITrackableFormPageContainerProps, IGetDataResponse>(Loader, {
        dataField: "getTrackable",
        getQuery: (props) => props.data,
        showIfNoQuery: false,
    }),
    withError<ITrackableFormPageContainerProps, IGetDataResponse>(Error, {
        dataField: "getTrackable",
        getQuery: (props) => props.data,
    }),
)(TrackableFormPageContainer);
