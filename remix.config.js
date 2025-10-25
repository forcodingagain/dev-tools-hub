/** @type {import('@remix-run/dev').AppConfig} */
export default {
  appDirectory: "app",
  assetsBuildDirectory: "public/build",
  publicPath: "/",
  serverBuildDirectory: "build",
  devServerPort: 3000,
  ignoredRouteFiles: ["**/.*", "**/*.test.{js,jsx,ts,tsx}"],
  serverModuleFormat: "esm",
  postcss: true,
  tailwind: true,
}