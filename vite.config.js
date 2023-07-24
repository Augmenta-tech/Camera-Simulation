import { splitVendorChunkPlugin, defineConfig } from 'vite'
import { threeMinifier } from "@yushijinhun/three-minifier-rollup"

export default defineConfig({
    plugins: [
        { ...threeMinifier(), enforce: "pre" },
        splitVendorChunkPlugin()
    ],
})
