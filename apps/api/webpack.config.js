const nodeExternals = require('webpack-node-externals');
const { TsconfigPathsPlugin } = require('tsconfig-paths-webpack-plugin');

// Bundle @nhl-app/* workspace packages into the output instead of leaving them
// as runtime requires. Without this, `node dist/main` tries to require the raw
// TypeScript source of @nhl-app/shared and crashes. The TsconfigPaths plugin
// resolves the workspace alias to libs/shared/src so ts-loader compiles it in.
module.exports = (options) => ({
  ...options,
  externals: [
    nodeExternals({
      allowlist: [/^@nhl-app\//],
    }),
  ],
  resolve: {
    ...options.resolve,
    plugins: [...(options.resolve?.plugins ?? []), new TsconfigPathsPlugin()],
  },
});
