import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { readContentCatalog } from "@bovinphang/craft-common";
const root=path.resolve(import.meta.dirname,"../../dist/package");
const installed=path.resolve(path.dirname(fileURLToPath(import.meta.resolve("@bovinphang/craft-common"))),"..");
const targets=["bec-architecture-design","bec-api-design","bec-auth-security","bec-database-design","bec-transaction-management","bec-observability","bec-testing-strategy","bec-code-review","bec-dependency-management","bec-spring-boot-project-standard","bec-fastapi-project-standard","bec-gin-project-standard","bec-axum-project-standard","bec-drogon-project-standard"];
test("fourteen backend entries consume exact installed core bytes and the full 21-entry common snapshot",()=>{
  const installedVersion=JSON.parse(fs.readFileSync(path.join(installed,"package.json"),"utf8")).version;
  const pkg=JSON.parse(fs.readFileSync(path.join(root,"package.json"),"utf8"));
  assert.equal(pkg.dependencies["@bovinphang/craft-common"],installedVersion);
  for(const language of ["en","zh-CN"] as const){
    const prefix=language==="en"?"":"localized/zh-CN/";
    const catalog=readContentCatalog(installed,language);
    assert.equal(catalog.skills.length,21);
    const metadata=JSON.parse(fs.readFileSync(path.join(root,prefix,"skills/metadata.json"),"utf8")) as Array<{id:string}>;
    assert.equal(metadata.length,42);
    assert.deepEqual(metadata.filter(m=>m.id.startsWith("cc-")).map(m=>m.id).sort(),catalog.skills.map(s=>s.id).sort());
    for(const id of targets)for(const suffix of [".md",".sources.json",".rules.json"]){
      const file=path.join(root,prefix,"skills",id,"references/common/engineering-practices"+suffix);
      assert.ok(fs.existsSync(file),"missing backend shared engineering resource: "+id+suffix);
      assert.deepEqual(fs.readFileSync(file),fs.readFileSync(path.join(installed,prefix,"methods/engineering-practices"+suffix)));
    }
  }
});
