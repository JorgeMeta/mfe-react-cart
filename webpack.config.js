const HtmlWebpackPlugin = require("html-webpack-plugin");
const path = require("path");
const {
  container: { ModuleFederationPlugin },
} = require("webpack");
const deps = require("./package.json").dependencies;

module.exports = {
  entry: "./src/index.js",
  mode: "development",
  output: {
    filename: "[name].[contenthash].js",
    path: path.resolve(__dirname, "dist"),
    publicPath: "auto",
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            presets: ["@babel/preset-env", "@babel/preset-react"],
          },
        },
      },
      {
        test: /\.css$/i,
        use: ["style-loader", "css-loader", "postcss-loader"],
      },
    ],
  },
  plugins: [
    new ModuleFederationPlugin({
      name: "cart",
      filename: "remoteEntry.js",
      exposes: {
        "./CartApp": "./src/App.jsx",
      },
      shared: {
        react: { singleton: true },
        "react-dom": { singleton: true },
      },
    }),
    new HtmlWebpackPlugin({
      template: "./public/index.html",
    }),
  ],
  devServer: {
    port: 8082,
    historyApiFallback: true,
  },
  resolve: {
    extensions: [".js", ".jsx"],
  },
};
