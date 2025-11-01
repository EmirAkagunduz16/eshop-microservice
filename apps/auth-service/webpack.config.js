const { NxAppWebpackPlugin } = require("@nx/webpack/app-plugin");
const { join, resolve } = require("path");

module.exports = {
  output: {
    path: join(__dirname, "dist"),
  },
  resolve: {
    alias: {
      "@packages": resolve(__dirname, "../../packages"),
      "@prisma/client": resolve(__dirname, "../../node_modules/@prisma/client"),
    },
    extensions: [".ts", ".js"],
  },
  externals: {
    "@prisma/client": "commonjs @prisma/client",
    ".prisma/client": "commonjs .prisma/client",
  },
  plugins: [
    new NxAppWebpackPlugin({
      target: "node",
      compiler: "tsc",
      main: "./src/main.ts",
      tsConfig: "./tsconfig.app.json",
      optimization: false,
      outputHashing: "none",
      generatePackageJson: true,
    }),
  ],
};
