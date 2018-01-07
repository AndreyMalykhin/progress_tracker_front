import en from "messages/en";

interface IMessage {
    __typename: string;
    id: string;
    key: string;
    text: string;
}

interface ITransformInput {
    [locale: string]: {
        [key: string]: string;
    };
}

function transformMessages(input: ITransformInput) {
    const output: { [locale: string]: IMessage[] } = {};

    // tslint:disable-next-line:forin
    for (const locale in input) {
        const inputMessages = input[locale];
        const outputMessages = [];

        // tslint:disable-next-line:forin
        for (const key in inputMessages) {
            outputMessages.push({ __typename: "Message", id: `${locale}_${key}`, key, text: inputMessages[key] });
        }

        output[locale] = outputMessages;
    }

    return output;
}

const messages = transformMessages({ en });

export default {
    defaults: {},
    resolvers: {
        Query: {
            messages: (rootValue: any, args: any) => {
                return messages[args.locale];
            },
        },
    },
};
