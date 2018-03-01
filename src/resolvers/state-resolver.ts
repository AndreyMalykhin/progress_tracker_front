import { CacheResolverMap } from "apollo-cache-inmemory";
import Type from "models/type";

interface IStateResolver {
    resolvers: CacheResolverMap;
    defaults?: { [key: string]: IData };
    nonPersistentDefaults?: { [key: string]: IData };
}

type IData = { [field: string]: any } & {
    __typename: Type;
    id: string;
};

export default IStateResolver;
