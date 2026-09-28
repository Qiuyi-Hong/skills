import { cpSync, copyFileSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const skillPath = 'plugins/railway/skills/use-railway';

export function description(text: string): string {
  const frontmatter = text.match(/^---\n([\s\S]*?)\n---\n/);
  if (!frontmatter) throw new Error('SKILL.md has no YAML frontmatter');
  const field = frontmatter[1].match(/^description:[^\n]*(?:\n[ \t]+[^\n]*)*/m);
  if (!field) throw new Error('SKILL.md has no description');
  return field[0];
}

export function sync(upstream: string, repo: string): void {
  const target = join(repo, 'skills/use-railway');
  const sourceDir = join(upstream, skillPath);
  const localDescription = description(readFileSync(join(target, 'SKILL.md'), 'utf8'));
  const source = readFileSync(join(sourceDir, 'SKILL.md'), 'utf8');
  const upstreamDescription = description(source);
  const baseline = join(repo, 'scripts/railway-upstream-description.txt');
  const value = localDescription.startsWith('description: >\n')
    ? localDescription.split('\n').slice(1).map((line) => line.trim()).join(' ')
    : localDescription.slice('description:'.length).trim();
  if (value.length > 1024) throw new Error('description exceeds 1024 characters');

  const updated = source.replace(upstreamDescription, localDescription);
  rmSync(target, { recursive: true });
  cpSync(sourceDir, target, { recursive: true });
  writeFileSync(join(target, 'SKILL.md'), updated);
  const license = join(repo, 'licenses/railway-skills.LICENSE');
  mkdirSync(dirname(license), { recursive: true });
  copyFileSync(join(upstream, 'LICENSE'), license);
  writeFileSync(baseline, `${upstreamDescription}\n`);
}

if (import.meta.main) {
  const [upstream] = process.argv.slice(2);
  if (!upstream) throw new Error('Usage: node scripts/sync_railway.ts <upstream-repo>');
  sync(upstream, fileURLToPath(new URL('..', import.meta.url)));
}
