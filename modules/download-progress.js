import Listr from "listr";
import { downloadResources } from "./download-resources.js";

export async function downloadWithProgress(urls, resourcesDirPath) {
  if (urls.length === 0) return;

  const tasks = new Listr(
    urls.map((url) => ({
      title: url,
      task: async () => {
        await downloadResources([url], resourcesDirPath);
      },
    })),
    {
      concurrent: true,
      exitOnError: false,
    },
  );

  await tasks.run();
}
