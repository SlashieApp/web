#!/usr/bin/env bun

import { existsSync } from 'node:fs'
import { readFile, readdir, stat, writeFile } from 'node:fs/promises'
import { basename, join, relative } from 'node:path'

type ExportConfig = {
  folder: string
}

const DEFAULT_CONFIG = {
  includeExtensions: ['.ts', '.tsx'],
  excludePatterns: [
    /\.stories\.[jt]sx?$/i,
    /\.test\.[jt]sx?$/i,
    /\.spec\.[jt]sx?$/i,
    /^\./,
  ],
}

const EXPORT_CONFIGS: ExportConfig[] = [
  { folder: 'src/ui' },
  { folder: 'src/app/(task)/components' },
]

const AUTOGEN_HEADER = `/**
 * AUTO-GENERATED FILE.
 * Run \`bun run exports-gen\` to regenerate this barrel.
 */
`

const normalizeImportPath = (root: string, filePath: string) => {
  const rel = relative(root, filePath).replaceAll('\\', '/')
  const withoutExt = rel.replace(/\.[^.]+$/, '')
  if (withoutExt.endsWith('/index')) {
    return `./${withoutExt.slice(0, -'/index'.length)}`
  }
  return `./${withoutExt}`
}

const toFallbackSymbol = (filePath: string) => {
  const normalized = filePath.replaceAll('\\', '/')
  if (normalized.endsWith('/index.ts') || normalized.endsWith('/index.tsx')) {
    const parts = normalized.split('/')
    return parts[parts.length - 2]
  }
  return (
    normalized
      .split('/')
      .at(-1)
      ?.replace(/\.[^.]+$/, '') ?? 'Unknown'
  )
}

const shouldExcludeName = (name: string) =>
  DEFAULT_CONFIG.excludePatterns.some((pattern) => pattern.test(name))

const hasAllowedExtension = (name: string) =>
  DEFAULT_CONFIG.includeExtensions.some((ext) => name.endsWith(ext))

const hasExtraDotsInBasename = (name: string) => {
  const withoutExt = name.replace(/\.[^.]+$/, '')
  return withoutExt.includes('.')
}

const uniqueSorted = (values: string[]) =>
  [...new Set(values)].sort((a, b) => a.localeCompare(b))

const parseExportsFromSource = (source: string) => {
  const valueExports = new Set<string>()
  const typeExports = new Set<string>()

  const namedValueFromDeclaration =
    /export\s+(?:async\s+)?(?:const|let|var|function|class|enum)\s+([A-Za-z_$][\w$]*)/g
  const namedTypeFromDeclaration =
    /export\s+(?:type|interface)\s+([A-Za-z_$][\w$]*)/g
  const namedValueList = /export\s*\{([^}]*)\}(?!\s*from)/g
  const namedTypeList = /export\s+type\s*\{([^}]*)\}(?!\s*from)/g
  const reExportValueList = /export\s*\{([^}]*)\}\s*from\s*['"][^'"]+['"]/g
  const reExportTypeList =
    /export\s+type\s*\{([^}]*)\}\s*from\s*['"][^'"]+['"]/g
  const namespaceReExport =
    /export\s+\*\s+as\s+([A-Za-z_$][\w$]*)\s+from\s*['"][^'"]+['"]/g

  let match: RegExpExecArray | null

  for (
    match = namedValueFromDeclaration.exec(source);
    match;
    match = namedValueFromDeclaration.exec(source)
  ) {
    valueExports.add(match[1])
  }
  for (
    match = namedTypeFromDeclaration.exec(source);
    match;
    match = namedTypeFromDeclaration.exec(source)
  ) {
    typeExports.add(match[1])
  }

  for (
    match = namedValueList.exec(source);
    match;
    match = namedValueList.exec(source)
  ) {
    const names = match[1]
      .split(',')
      .map((part) => part.trim())
      .filter(Boolean)
      .map((part) => {
        if (part.startsWith('type ')) {
          const typeName =
            part.replace(/^type\s+/, '').split(/\s+as\s+/i)[1] ??
            part.replace(/^type\s+/, '')
          typeExports.add(typeName.trim())
          return null
        }
        const aliasParts = part.split(/\s+as\s+/i).map((p) => p.trim())
        return aliasParts[1] ?? aliasParts[0]
      })
      .filter((name): name is string => Boolean(name))

    for (const name of names) valueExports.add(name)
  }

  for (
    match = namedTypeList.exec(source);
    match;
    match = namedTypeList.exec(source)
  ) {
    const names = match[1]
      .split(',')
      .map((part) => part.trim())
      .filter(Boolean)
      .map((part) => {
        const aliasParts = part.split(/\s+as\s+/i).map((p) => p.trim())
        return aliasParts[1] ?? aliasParts[0]
      })
    for (const name of names) typeExports.add(name)
  }
  for (
    match = reExportValueList.exec(source);
    match;
    match = reExportValueList.exec(source)
  ) {
    const names = match[1]
      .split(',')
      .map((part) => part.trim())
      .filter(Boolean)
      .map((part) => {
        if (part.startsWith('type ')) return null
        const aliasParts = part.split(/\s+as\s+/i).map((p) => p.trim())
        return aliasParts[1] ?? aliasParts[0]
      })
      .filter((name): name is string => Boolean(name))
    for (const name of names) valueExports.add(name)
  }
  for (
    match = reExportTypeList.exec(source);
    match;
    match = reExportTypeList.exec(source)
  ) {
    const names = match[1]
      .split(',')
      .map((part) => part.trim())
      .filter(Boolean)
      .map((part) => {
        const aliasParts = part.split(/\s+as\s+/i).map((p) => p.trim())
        return aliasParts[1] ?? aliasParts[0]
      })
    for (const name of names) typeExports.add(name)
  }
  for (
    match = namespaceReExport.exec(source);
    match;
    match = namespaceReExport.exec(source)
  ) {
    valueExports.add(match[1])
  }

  return {
    values: uniqueSorted([...valueExports]),
    types: uniqueSorted([...typeExports]),
  }
}

const collectModuleFiles = async (
  root: string,
  current = root,
): Promise<string[]> => {
  const entries = await readdir(current, { withFileTypes: true })
  const filtered = entries.filter((entry) => !shouldExcludeName(entry.name))
  const files: string[] = []

  if (current !== root) {
    const hasIndexTs = filtered.some(
      (entry) => entry.isFile() && entry.name === 'index.ts',
    )
    const hasIndexTsx = filtered.some(
      (entry) => entry.isFile() && entry.name === 'index.tsx',
    )
    if (hasIndexTs || hasIndexTsx) {
      const indexFile = hasIndexTs ? 'index.ts' : 'index.tsx'
      files.push(join(current, indexFile))
      return files
    }
  }

  for (const entry of filtered) {
    const absolutePath = join(current, entry.name)
    if (entry.isDirectory()) {
      files.push(...(await collectModuleFiles(root, absolutePath)))
      continue
    }

    if (!entry.isFile() || !hasAllowedExtension(entry.name)) continue
    if (hasExtraDotsInBasename(entry.name)) continue
    if (entry.name === 'index.ts' && current === root) continue
    if (entry.name === 'index.tsx' && current === root) continue
    if (
      DEFAULT_CONFIG.excludePatterns.some((pattern) =>
        pattern.test(absolutePath),
      )
    )
      continue
    files.push(absolutePath)
  }

  return files
}

const buildExportLineSet = async (root: string, files: string[]) => {
  const lines = new Set<string>()

  for (const filePath of files) {
    const importPath = normalizeImportPath(root, filePath)
    const source = await readFile(filePath, 'utf8')
    const exportsFound = parseExportsFromSource(source)

    if (exportsFound.values.length > 0) {
      lines.add(
        `export { ${exportsFound.values.join(', ')} } from '${importPath}'`,
      )
    }
    if (exportsFound.types.length > 0) {
      lines.add(
        `export type { ${exportsFound.types.join(', ')} } from '${importPath}'`,
      )
    }
    if (exportsFound.values.length === 0 && exportsFound.types.length === 0) {
      if (
        basename(filePath) === 'index.ts' ||
        basename(filePath) === 'index.tsx'
      ) {
        lines.add(`export * from '${importPath}'`)
      } else {
        lines.add(
          `export { ${toFallbackSymbol(filePath)} } from '${importPath}'`,
        )
      }
    }
  }

  return uniqueSorted([...lines])
}

const generateBarrelForFolder = async (folder: string) => {
  const folderPath = join(process.cwd(), folder)
  if (!existsSync(folderPath)) {
    console.warn(`[exports-gen] Skipping missing folder: ${folder}`)
    return
  }
  const stats = await stat(folderPath)
  if (!stats.isDirectory()) {
    console.warn(`[exports-gen] Skipping non-directory path: ${folder}`)
    return
  }

  const files = await collectModuleFiles(folderPath)
  console.log(
    `[exports-gen] Discovered ${files.length} module files in ${folder}: ${
      files.length > 0
        ? files.map((file) => relative(process.cwd(), file)).join(', ')
        : '(none)'
    }`,
  )
  const lines = await buildExportLineSet(folderPath, files)
  const outputPath = join(folderPath, 'index.ts')
  const body = lines.length > 0 ? `${lines.join('\n')}\n` : ''
  await writeFile(outputPath, `${AUTOGEN_HEADER}\n${body}`, 'utf8')
  console.log(`[exports-gen] Updated ${relative(process.cwd(), outputPath)}`)
  return {
    folder,
    outputPath: relative(process.cwd(), outputPath),
    moduleCount: files.length,
  }
}

const main = async () => {
  const results: Array<{
    folder: string
    outputPath: string
    moduleCount: number
  }> = []
  for (const config of EXPORT_CONFIGS) {
    const result = await generateBarrelForFolder(config.folder)
    if (result) results.push(result)
  }
  console.log(
    `[exports-gen] Success for ${results.length}/${EXPORT_CONFIGS.length} configs: ${results
      .map((result) => `${result.outputPath} (${result.moduleCount} modules)`)
      .join('; ')}`,
  )
}

main().catch((error) => {
  console.error('[exports-gen] Failed to generate export barrels')
  console.error(error)
  process.exit(1)
})
