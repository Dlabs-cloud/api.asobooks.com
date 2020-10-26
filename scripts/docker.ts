import * as shell from 'shelljs';

const tempDir = '.docker/';
shell.rm('-r', tempDir);
shell.mkdir(tempDir);
shell.cp('package.json', tempDir);
shell.cd(tempDir);
shell.exec('npm i --production');
shell.exec('npm run build');
shell.cd('..');
shell.exec('pwd');
shell.exec(`docker build -t uncletee/asobooks-api .`);
shell.rm('-r', tempDir);