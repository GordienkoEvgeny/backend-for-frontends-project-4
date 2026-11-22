#!/usr/bin/env node

import { program } from "commander";
import { output } from "./modules/output.js";

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
