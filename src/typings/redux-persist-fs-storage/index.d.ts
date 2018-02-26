declare module "redux-persist-fs-storage" {
    declare function FSStorage<T>(): PersistentStorage<PersistedData<T>>;

    export default FSStorage;
}
