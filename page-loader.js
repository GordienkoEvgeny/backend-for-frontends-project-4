#!/usr/bin/env node
import { program } from "commander";
import { output } from "./modules/output.js";

// явно включаем ОБА неймспейса через debug
import debug from "debug";
debug.enable("page-loader,axios");

// подключаем axios-debug-log (он добавит свои логи, но не затронет page-loader)
import { createRequire } from "module";
const require = createRequire(import.meta.url);
require("axios-debug-log");

const command = (links, options) => {
  for (const link of links) {
    if (link) {
      output(options.output, link);
    }
  }
};

program
  .name("page-loader")
  .version("0.0.1")
  .argument("<link...>", "link to page")
  .option("-o --output [dir]", "output dir")
  .action(command)
  .parse(process.argv);
