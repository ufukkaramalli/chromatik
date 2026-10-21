/**
 * Semantic Release Configuration
 * @see https://semantic-release.gitbook.io/semantic-release/
 */
module.exports = {
  branches: [
    'main',
    { name: 'beta', prerelease: true },
    { name: 'alpha', prerelease: true },
  ],
  plugins: [
    [
      '@semantic-release/commit-analyzer',
      {
        preset: 'conventionalcommits',
        releaseRules: [
          { breaking: true, release: 'major' },
          { type: 'feat', release: 'minor' },
          { type: 'fix', release: 'patch' },
          { type: 'perf', release: 'patch' },
          { type: 'revert', release: 'patch' },
          { type: 'refactor', release: 'patch' },
          { type: 'docs', scope: 'README', release: 'patch' },
        ],
      },
    ],
    [
      '@semantic-release/release-notes-generator',
      {
        preset: 'conventionalcommits',
        presetConfig: {
          types: [
            { type: 'feat', section: '✨ Features' },
            { type: 'fix', section: '🐛 Bug Fixes' },
            { type: 'perf', section: '⚡ Performance Improvements' },
            { type: 'refactor', section: '♻️ Code Refactoring' },
            { type: 'revert', section: '⏪ Reverts' },
            { type: 'docs', section: '📝 Documentation' },
            { type: 'style', section: '💄 Styles', hidden: true },
            { type: 'test', section: '✅ Tests', hidden: true },
            { type: 'build', section: '📦 Build System', hidden: true },
            { type: 'ci', section: '👷 Continuous Integration', hidden: true },
            { type: 'chore', section: '🔧 Miscellaneous Chores', hidden: true },
          ],
        },
      },
    ],
    [
      '@semantic-release/changelog',
      {
        changelogFile: 'CHANGELOG.md',
        changelogTitle:
          '# Changelog\n\nAll notable changes to this project will be documented in this file.\nSee [Conventional Commits](https://www.conventionalcommits.org/) for commit guidelines.',
      },
    ],
    [
      '@semantic-release/exec',
      {
        prepareCmd: 'node scripts/sync-versions.js ${nextRelease.version}',
      },
    ],
    [
      '@semantic-release/git',
      {
        assets: [
          'CHANGELOG.md',
          'package.json',
          'frontend/package.json',
          'backend/package.json',
        ],
        message: 'chore(release): ${nextRelease.version} [skip ci]\n\n${nextRelease.notes}',
      },
    ],
    [
      '@semantic-release/github',
      {
        assets: [],
      },
    ],
  ],
};
