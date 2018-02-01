import gql from "graphql-tag";
import ReportReason from "models/report-reason";
import Type from "models/type";
import { MutationFunc } from "react-apollo/types";

interface IReportUserResponse {
    reportUser: {
        user: {
            id: string;
            isReported: boolean;
        };
    };
}

const reportUserQuery = gql`
mutation ReportUser($id: ID!, $reason: ReportReason!) {
    reportUser(id: $id, reason: $reason) {
        user {
            id
            isReported
        }
    }
}`;

async function reportUser(
    id: string,
    reason: ReportReason,
    mutate: MutationFunc<IReportUserResponse>,
) {
    await mutate({
        optimisticResponse: {
            __typename: Type.Mutation,
            reportUser: {
                __typename: Type.ReportUserResponse,
                user: { __typename: Type.User, id, isReported: true },
            },
        } as IReportUserResponse,
        variables: {id, reason },
    });
}

export { reportUser, reportUserQuery, IReportUserResponse };
