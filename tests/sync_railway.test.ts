import assert from 'node:assert/strict';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';
import { description, sync } from '../scripts/sync_railway.ts';

test('published description fits the 1024-character limit', () => {
  const skill = readFileSync(new URL('../skills/use-railway/SKILL.md', import.meta.url), 'utf8');
  const value = description(skill).replace(/^description: >\n/, '').replace(/\n +/g, ' ').trim();
  assert.ok(value.length <= 1024, `Description is ${value.length} characters`);
});

test('sync mirrors upstream except for the local description', () => {
  const root = mkdtempSync(join(tmpdir(), 'railway-sync-'));
  try {
    const repo = join(root, 'repo');
    const target = join(repo, 'skills/use-railway');
    const source = join(root, 'upstream/plugins/railway/skills/use-railway');
    mkdirSync(target, { recursive: true });
    mkdirSync(join(repo, 'scripts'), { recursive: true });
    mkdirSync(source, { recursive: true });
    const local = '---\nname: use-railway\ndescription: >\n  Local description.\nallowed-tools: Bash\n---\n\n# Original\n';
    const upstream = '---\nname: use-railway\ndescription: Upstream description.\nallowed-tools: Bash\n---\n\n# Updated\n';
    writeFileSync(join(target, 'SKILL.md'), local);
    writeFileSync(join(target, 'stale.md'), 'remove me');
    writeFileSync(join(source, 'SKILL.md'), upstream);
    writeFileSync(join(source, 'new.md'), 'new reference');
    writeFileSync(join(root, 'upstream/LICENSE'), 'Railway license');
    const baseline = join(repo, 'scripts/railway-upstream-description.txt');
    writeFileSync(baseline, 'description: Upstream description.\n');

    sync(join(root, 'upstream'), repo);
    const expected = upstream.replace('description: Upstream description.', 'description: >\n  Local description.');
    assert.equal(readFileSync(join(target, 'SKILL.md'), 'utf8'), expected);
    assert.equal(existsSync(join(target, 'stale.md')), false);
    assert.equal(readFileSync(join(target, 'new.md'), 'utf8'), 'new reference');
    assert.equal(readFileSync(join(repo, 'licenses/railway-skills.LICENSE'), 'utf8'), 'Railway license');
    sync(join(root, 'upstream'), repo);
    assert.equal(readFileSync(join(target, 'SKILL.md'), 'utf8'), expected);

    const changed = upstream.replace('Upstream description.', 'Changed upstream description.');
    writeFileSync(join(source, 'SKILL.md'), changed);
    writeFileSync(join(source, 'changed-only.md'), 'new reference');
    sync(join(root, 'upstream'), repo);
    assert.equal(readFileSync(join(target, 'SKILL.md'), 'utf8'), changed.replace('description: Changed upstream description.', 'description: >\n  Local description.'));
    assert.equal(readFileSync(join(target, 'changed-only.md'), 'utf8'), 'new reference');
    assert.equal(readFileSync(baseline, 'utf8'), 'description: Changed upstream description.\n');
    sync(join(root, 'upstream'), repo);

    writeFileSync(join(target, 'SKILL.md'), expected.replace('Local description.', '—'.repeat(400)));
    sync(join(root, 'upstream'), repo); // 400 characters, but over 1024 UTF-8 bytes
    writeFileSync(join(target, 'SKILL.md'), expected.replace('Local description.', 'x'.repeat(1025)));
    assert.throws(() => sync(join(root, 'upstream'), repo), /1024/);
    assert.equal(description(readFileSync(join(target, 'SKILL.md'), 'utf8')), 'description: >\n  ' + 'x'.repeat(1025));
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
