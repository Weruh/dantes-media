import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const tailwindConfigPath = fileURLToPath(new URL("./tailwind.config.js", import.meta.url));

export default {
  plugins: {
    tailwindcss: { config: resolve(tailwindConfigPath) },
    autoprefixer: {},
  },
};
