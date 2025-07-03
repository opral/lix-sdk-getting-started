import { newLixFile, openLix } from "@lix-js/sdk";
import { plugin as jsonPlugin } from "@lix-js/plugin-json";

// Create and open a new Lix file
const lixFile = await newLixFile();
const lix = await openLix({
  blob: lixFile,
  providePlugins: [jsonPlugin],
});

// Insert a JSON file
const data = {
  name: "My Project",
  version: "1.0.0",
};

await lix.db
  .insertInto("file")
  .values({
    path: "/config.json",
    data: new TextEncoder().encode(JSON.stringify(data)),
  })
  .execute();

// Make a change
data.name = "My Cool Project"
data.version = "1.1.0";

await lix.db
  .updateTable("file")
  .where("path", "=", "/config.json")
  .set({
    data: new TextEncoder().encode(JSON.stringify(data)),
  })
  .execute();

// 1. Get the last two versions of a JSON file from history
const fileHistory = await lix.db
  .selectFrom("file_history")
  .innerJoin("file", "file.id", "file_history.id")
  .where("file.path", "=", "/config.json")
  .where(
    "lixcol_change_set_id", "=", 
      lix.db.selectFrom("version")
      .select("change_set_id")
      .where("version.name", "=", "main")
  )
  .orderBy("lixcol_depth", "desc")
  .selectAll()
  .execute();

const afterState = JSON.parse(new TextDecoder().decode(fileHistory[0].data));
const beforeState = JSON.parse(new TextDecoder().decode(fileHistory[1].data));

console.log(beforeState, afterState)

// 2. Compare the two states to generate a diff.
//
// This is a simplified example. In a real app,
// you would likely use a diffing library.
const diffOutput = [];
if (beforeState.name !== afterState.name) {
  diffOutput.push(`- name: ${beforeState.name}`);
  diffOutput.push(`+ name: ${afterState.name}`);
}
if (beforeState.version !== afterState.version) {
  diffOutput.push(`- version: ${beforeState.version}`);
  diffOutput.push(`+ version: ${afterState.version}`);
}

// 3. The diff can then be displayed in your application.
console.log(diffOutput.join("\n"));