import ts from "rollup-plugin-ts";
import terser from "@rollup/plugin-terser";

const isProduction = !process.env.ROLLUP_WATCH;

function basePlugins() {
  return [
    ts(),
    // minify if we're building for production
    // (aka. npm run build instead of npm run dev)
    isProduction &&
      terser({
        keep_classnames: true,
        keep_fnames: true,
        output: {
          comments: false,
        },
      }),
  ];
}

const config = [
  {
    input: "src/index.ts",
    output: {
      file: "dist/tririga-js-sdk.js",
      format: "cjs",
      sourcemap: isProduction,
    },
    plugins: basePlugins(),
    watch: { clearScreen: false },
  },
  {
    input: "src/index.ts",
    output: {
      file: "dist/tririga-js-sdk.es.mjs",
      format: "es",
      sourceMap: isProduction,
    },
    plugins: basePlugins(),
    watch: { clearScreen: false },
  },
];

export default config;
