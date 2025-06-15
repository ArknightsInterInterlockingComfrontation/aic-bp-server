const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");
const baseUrl = "./src/";
const ourDir = "./.output";
const folders = ["public","assets"];
const files = ["package.json", "README.md"];

deleteFolderRecursive(ourDir);

folders.forEach((folder) => {
  let srcFolder = path.join(baseUrl, folder);
  copyFolderRecursive(`./${srcFolder}`, `${ourDir}/${folder}`);
});

files.forEach((file) => {
  if (!fs.existsSync(`${ourDir}/${file}`)) {
    fs.copyFileSync(`./${file}`, `${ourDir}/${file}`);
  }
});

try {
  execSync("tsc", { stdio: "inherit" });
  console.log("编译成功！运行 `\x1b[33mnpm run preview\x1b[0m` 执行编译文件 \n");
} catch (error) {
  console.error("编译失败:", error.message);
}

function deleteFolderRecursive(path) {
  if (fs.existsSync(path)) {
    fs.readdirSync(path).forEach((file, index) => {
      const curPath = `${path}/${file}`;
      if (fs.lstatSync(curPath).isDirectory()) {
        deleteFolderRecursive(curPath);
      } else {
        fs.unlinkSync(curPath);
      }
    });
    fs.rmdirSync(path);
  }
}

function copyFolderRecursive(sourcePath, targetPath) {
  if (!fs.existsSync(targetPath)) {
    fs.mkdirSync(targetPath, { recursive: true });
  }
  fs.readdirSync(sourcePath).forEach((file, index) => {
    const curSourcePath = path.join(sourcePath, file);
    const curTargetPath = path.join(targetPath, file);
    if (fs.lstatSync(curSourcePath).isDirectory()) {
      copyFolderRecursive(curSourcePath, curTargetPath);
    } else {
      fs.copyFileSync(curSourcePath, curTargetPath);
    }
  });
}
