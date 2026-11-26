import Listr from "listr";
import { downloadResources } from "./download-resources.js";

export async function downloadWithProgress(resources, resourcesDirPath) {
  if (resources.length === 0) return;

  const tasks = new Listr(
    resources.map((resource) => ({
      title: resource.url,
      task: async () => {
        await downloadResources([resource], resourcesDirPath);
      },
    })),
    {
      concurrent: true,
      exitOnError: false,
    },
  );

  await tasks.run();
}
