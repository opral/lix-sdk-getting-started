import { openLix } from "@lix-js/sdk";
import { plugin as jsonPlugin} from "@lix-js/plugin-json"

const lix = await openLix({
    providePlugins: [jsonPlugin]
})

console.log(lix.plugin.getAllSync())