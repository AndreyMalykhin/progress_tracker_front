import { QueryProps } from "react-apollo";
import QueryStatus from "utils/query-status";

type IResult = { queryStatus: QueryStatus } & {
    [key: string]: any;
};

function getDataOrQueryStatus(query: QueryProps, dataKey: string = "data") {
    const { networkStatus: queryStatus, error } = query;

    if (queryStatus === QueryStatus.InitialLoading) {
        return { queryStatus };
    } else if (queryStatus === QueryStatus.Error || error) {
        return { queryStatus: QueryStatus.Error };
    }

    return { queryStatus, [dataKey]: query };
}

export default getDataOrQueryStatus;
