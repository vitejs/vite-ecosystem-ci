import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { pathToFileURL } from 'node:url'

import type { DisableWorkflow } from './types.d.ts'

type SuiteList = 'from-pr' | 'scheduled' | 'selected'
type DisableWorkflowKey = keyof DisableWorkflow
type TestModule = { disableWorkflow?: DisableWorkflow }

const root = import.meta.dirname
const testsDirectory = path.join(root, 'tests')
const workflowsDirectory = path.join(root, '.github/workflows')
const check = process.argv.includes('--check')

const suiteFiles = fs
	.readdirSync(testsDirectory)
	.filter((file) => !file.startsWith('_') && file.endsWith('.ts'))
	.toSorted()
const suites = await Promise.all(
	suiteFiles.map(async (file) => {
		const fileUrl = pathToFileURL(path.join(testsDirectory, file)).href
		const { disableWorkflow } = (await import(fileUrl)) as TestModule
		return { name: path.basename(file, path.extname(file)), disableWorkflow }
	}),
)

const disableWorkflowKeys: Record<SuiteList, DisableWorkflowKey> = {
	'from-pr': 'selected',
	scheduled: 'scheduled',
	selected: 'selected',
}

const expectedLists: Record<string, Partial<Record<SuiteList, number>>> = {
	'ecosystem-ci-from-pr-rolldown.yml': { 'from-pr': 1, scheduled: 1 },
	'ecosystem-ci-from-pr.yml': { 'from-pr': 1, scheduled: 1 },
	'ecosystem-ci-rolldown.yml': { scheduled: 1 },
	'ecosystem-ci-selected.yml': { selected: 1 },
	'ecosystem-ci.yml': { scheduled: 1 },
}

let hasChanges = false

for (const [file, expected] of Object.entries(expectedLists)) {
	const filePath = path.join(workflowsDirectory, file)
	const source = fs.readFileSync(filePath, 'utf8')
	const counts: Partial<Record<SuiteList, number>> = {}
	const generated = source.replace(
		/^(\s*)# test-suites:start (from-pr|scheduled|selected)\n[\s\S]*?^\1# test-suites:end$/gm,
		(_block, indentation: string, list: SuiteList) => {
			counts[list] = (counts[list] ?? 0) + 1
			return generateSuiteList(indentation, list)
		},
	)

	for (const [list, count] of Object.entries(expected)) {
		if (counts[list as SuiteList] !== count) {
			throw new Error(
				`expected ${count} ${list} test suite list(s) in ${file}, found ${counts[list as SuiteList] ?? 0}`,
			)
		}
	}

	if (generated === source) continue
	if (check) {
		console.error(`${file} has outdated generated test suite lists`)
		hasChanges = true
	} else {
		fs.writeFileSync(filePath, generated)
		console.log(`updated ${file}`)
	}
}

if (hasChanges) {
	console.error('run `pnpm workflow:generate` to update the workflows')
	process.exitCode = 1
}

function generateSuiteList(indentation: string, list: SuiteList) {
	const lines = [
		`${indentation}# test-suites:start ${list}`,
		`${indentation}# DO NOT EDIT, see generate-workflows.ts`,
	]
	if (list === 'from-pr') lines.push(`${indentation}- "-"`)

	for (const suite of suites) {
		const reason = suite.disableWorkflow?.[disableWorkflowKeys[list]]
		lines.push(
			reason ? `${indentation}# - ${suite.name} # ${reason}` : `${indentation}- ${suite.name}`,
		)
	}

	lines.push(`${indentation}# test-suites:end`)
	return lines.join('\n')
}
