//@ts-check
'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const path = require('path');
/**@type {import('webpack').Configuration}*/
const config = {
    target: 'node', // vscode extensions run in a Node.js-context 📖 -> https://webpack.js.org/configuration/node/
    entry: './src/extension.ts', // the entry point of this extension, 📖 -> https://webpack.js.org/configuration/entry-context/
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'extension.js',
        libraryTarget: "commonjs2",
        devtoolModuleFilenameTemplate: "../[resource-path]",
    },
    devtool: 'source-map',
    externals: {
        vscode: "commonjs vscode" // the vscode-module is created on-the-fly and must be excluded. Add other modules that cannot be webpack'ed, 📖 -> https://webpack.js.org/configuration/externals/
    },
    resolve: {
        extensions: ['.ts', '.js']
    },
    module: {
        rules: [{
                test: /\.ts$/,
                exclude: /node_modules/,
                use: [{
                        loader: 'ts-loader',
                    }]
            }]
    },
};
module.exports = config;
//# sourceMappingURL=webpack.config.js.map