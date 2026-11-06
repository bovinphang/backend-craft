import {spawnSync} from 'node:child_process';import path from 'node:path';
const result=spawnSync(path.resolve('.build/owned.exe'),[],{stdio:'inherit',windowsHide:true});if(result.error)process.stderr.write(result.error.message+'\n');process.exitCode=result.status??1;
