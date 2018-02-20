import Type from "models/type";
import IStateResolver from "resolvers/state-resolver";

interface IMessage {
    __typename: string;
    id: string;
    key: string;
    text: string;
}

interface IMessages {
    [locale: string]: {
        [key: string]: string;
    };
}

function transformMessages(input: IMessages) {
    const output: { [locale: string]: IMessage[] } = {};

    // tslint:disable-next-line:forin
    for (const locale in input) {
        const inputMessages = input[locale];
        const outputMessages = [];

        // tslint:disable-next-line:forin
        for (const key in inputMessages) {
            outputMessages.push({
                __typename: Type.Message,
                id: `${locale}_${key}`,
                key,
                text: inputMessages[key],
            });
        }

        output[locale] = outputMessages;
    }

    return output;
}

function makeMessageResolver(messages: IMessages) {
    const transformedMessages = transformMessages(messages);
    return {
        defaults: {},
        resolvers: {
            Query: {
                getMessages: (rootValue, args) => {
                    return transformedMessages[args.locale];
                },
            },
        },
    } as IStateResolver;
}

export { makeMessageResolver };
