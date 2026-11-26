import process from "node:process";
import { output } from "./modules/output.js";

export default (url, outputDir = process.cwd()) => output(outputDir, url);
