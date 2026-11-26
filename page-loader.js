#!/usr/bin/env node
import { program } from "commander";
import { output } from "./modules/output.js";

import { createRequire } from "module";
const require = createRequire(import.meta.url);
require("axios-debug-log");

const command = (links, options) => {
  const promises = links.map((link) => {
    return output(options.output, link, true).catch((e) => {
      console.error(`❌ Ошибка: ${e.message}`);
      process.exitCode = 1;
    });
  });

  return Promise.all(promises);
};

program
  .name("page-loader")
  .version("0.0.1")
  .argument("<link...>", "link to page")
  .option("-o --output [dir]", "output dir", process.cwd())
  .action(command)
  .parse(process.argv);
