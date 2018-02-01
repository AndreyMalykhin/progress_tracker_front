const fetch = require("node-fetch");
const fs = require("fs");

fetch("http://localhost:3000/graphql", {
    body: JSON.stringify({
        query: `
        {
            __schema {
                types {
                    kind
                    name
                    possibleTypes {
                    name
                    }
                }
            }
        }`,
    }),
    headers: { "Content-Type": "application/json" },
    method: "POST",
})
    .then((result) => result.json())
    .then((result) => {
        // here we're filtering out any type information unrelated to unions or
        // interfaces
        const filteredData = result.data.__schema.types.filter(
            (type) => type.possibleTypes !== null,
        );
        result.data.__schema.types = filteredData;
        const resultStr = "/* tslint:disable */\nexport default " +
            JSON.stringify(result.data, undefined, 4) + ";\n";
        fs.writeFile(
            "src/utils/fragment-types.ts",
            resultStr,
            (err) => {
                if (err) {
                    console.error("Error writing fragmentTypes file", err);
                    return;
                }

                console.log("Fragment types successfully extracted!");
            }
        );
    });
