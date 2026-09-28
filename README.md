# Agent skills

Install the [Railway skill](skills/use-railway/SKILL.md):

```sh
npx skills add Qiuyi-Hong/skills --skill use-railway
```

The skill is copied from [Railway's upstream repository](https://github.com/railwayapp/railway-skills/tree/main/plugins/railway/skills/use-railway), including its references and scripts. Only the description is customized. Railway's [MIT license](licenses/railway-skills.LICENSE) is included.

The [sync workflow](.github/workflows/sync-railway.yml) runs daily at **09:00 Europe/London** (GMT/BST), or manually. It copies upstream changes while keeping the local description. If Railway changes its description, the automatic sync stops and opens an issue with the diff. After reviewing, run the workflow manually with **approve_description_change** to accept the new upstream baseline. After `npm ci`, you can also run `npm run sync:railway -- /path/to/railway-skills --approve-description-change` locally after review; run `npm run typecheck && npm test` to verify. Once pushed to a public GitHub repository, the skill is installable via `npx skills add`. [skills.sh](https://www.skills.sh/docs/faq) lists skills after installs through the CLI; there is no separate publishing command.
