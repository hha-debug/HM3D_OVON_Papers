import path from 'node:path';
import { pathToFileURL } from 'node:url';
const workspaceDir = process.cwd();
const buildDir = path.join(workspaceDir, '.build_ppt', '一级分支分类_20261016');
const skillDir = 'C:/Users/horizona/.codex/plugins/cache/openai-primary-runtime/presentations/26.1007.11041/skills/presentations';
process.env.RUNTIME_NODE_MODULES = 'C:/Users/horizona/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules';
const { finalizePresentation } = await import(pathToFileURL(path.join(skillDir, 'container_tools', 'artifact_tool_utils.mjs')).href);
const finalPath = path.join(workspaceDir, 'output', '一级分支分类PPT', '一级分支分类_20261016.pptx');
const result = await finalizePresentation({
  workspaceDir,
  candidatePath: path.join(buildDir, 'candidate.pptx'),
  finalPath,
  pythonExecutable: 'C:/Users/horizona/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/python.exe',
  integrityValidatorPath: path.join(skillDir, 'container_tools', 'inspect_presentation_package_integrity.py'),
  layoutValidatorPath: path.join(skillDir, 'container_tools', 'inspect_presentation_layout_geometry.py'),
  layoutArgs: ['--expected-slide-size-emu', '12192000,6858000', '--validate-bullet-geometry', '--validate-heading-fit',
    ...[3, 4, 5, 6, 7, 8, 9].flatMap(n => ['--require-native-table-slide', String(n)])],
  requiredNativeTableOwnerSlides: [3, 4, 5, 6, 7, 8, 9],
  explicitTotalSlideCount: 9,
  fontPolicy: { basis: 'design', families: ['Microsoft YaHei'] },
  verifyArtifactToolImport: true,
  receiptPath: path.join(buildDir, '一级分支分类_20261016.pptx.validation.json'),
});
console.log(JSON.stringify({ finalPath, result }, null, 2));
