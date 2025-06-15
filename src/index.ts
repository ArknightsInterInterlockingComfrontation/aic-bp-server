import { server } from "./modules/express";
import config from "./app.config";
import "./modules/socket";
import "./modules/winston"
import chalk from 'chalk';

server.listen(config.port, () => {
  console.log(chalk.green("[Success]"),`服务在 ${config.port} 端口启动`);
});