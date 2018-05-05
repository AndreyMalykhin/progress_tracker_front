const webpack = require("webpack");
const path = require("path");
const TsconfigPathsPlugin = require("tsconfig-paths-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const CleanWebpackPlugin = require("clean-webpack-plugin");
const nodeExternals = require("webpack-node-externals");

const imgRegex = /^images\/.+\..+$/;
const isDevEnv = process.env.NODE_ENV === "development";
let devtool = "inline-source-map";

if (!isDevEnv) {
    devtool = "source-map";
}

module.exports = {
    mode: process.env.NODE_ENV,
    devtool,
    target: "node",
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: "ts-loader",
                include: path.resolve(__dirname, "src")
            }
        ]
    },
    resolve: {
        extensions: [".ts", ".tsx"],
        plugins: [new TsconfigPathsPlugin()],
        modules: [path.resolve(__dirname, "src"), "node_modules"]
    },
    entry: {
        index: path.resolve(__dirname, "src", "index.ts")
    },
    output: {
        filename: "[name].js",
        path: path.resolve(__dirname, "build")
    },
    externals: [appExternals, nodeExternals()],
    plugins: [
        new webpack.EnvironmentPlugin(process.env),
        new CleanWebpackPlugin([path.resolve(__dirname, "build")]),
        new CopyWebpackPlugin([
            {
                from: path.resolve(__dirname, "src", "images"),
                to: path.resolve(__dirname, "build", "images")
            }
        ])
    ]
};

function appExternals(context, request, callback) {
    if (imgRegex.test(request)) {
        return callback(null, "commonjs " + request);
    }

    return callback();
}
