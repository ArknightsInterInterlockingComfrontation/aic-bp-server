import express, { Router } from "express";
import fs from "fs";
import path from "path";
import  chalk from "chalk"

const router: Router = express.Router();

const existingPaths = new Set();

function loadRoutes(routeFolder: string, parentPath = "") {
  const files = fs.readdirSync(routeFolder);
  files.forEach(async (file) => {
    const filePath = path.join(routeFolder, file);
    const isDirectory = fs.statSync(filePath).isDirectory();
    if (isDirectory) {
      let subfolder = path.join(parentPath, file);
      subfolder = subfolder.startsWith("/") ? subfolder : `/${subfolder}`;
      loadRoutes(filePath, subfolder);
    } else if ((file.endsWith(".js") || file.endsWith(".ts")) && !file.endsWith(".d.ts")) {
      const routePath = path.parse(file).name === 'index' ? `${parentPath}` : `${parentPath}/${path.parse(file).name}`;
      if (existingPaths.has(routePath)) {
        console.warn(chalk.yellow("[Warning]"),`重复的路由路径: ${routePath} (${filePath})`);
      } else {
        existingPaths.add(routePath);
        const route = await import(filePath);
        router.use(routePath, route.router);
      }
    }
  });
}

const routesFolderPath = path.join(__dirname, "routes");
loadRoutes(routesFolderPath);

export default router;