import Type from "models/type";
import defaultId from "utils/default-id";

function makeSettingsResolver(defaultLocale: string) {
    return {
        defaults: {
            settings: {
                __typename: Type.Settings,
                id: defaultId,
                locale: defaultLocale,
            },
        },
        resolvers: {},
    };
}

export { makeSettingsResolver };
