import withNuxt from './.nuxt/eslint.config.mjs'
import eslintConfigPrettier from "eslint-config-prettier/flat";
import { globalIgnores } from "eslint/config";

export default withNuxt(
  eslintConfigPrettier,
  globalIgnores(["**/test/**"])
)