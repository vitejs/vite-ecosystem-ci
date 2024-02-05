// eslint-disable-next-line n/no-unpublished-import
import type { Agent } from '@antfu/ni'
export interface EnvironmentData {
	root: string
	workspace: string
	sveltePath: string
	cwd: string
	env: ProcessEnv
}

export interface RunOptions {
	workspace: string
	root: string
	sveltePath: string
	svelteMajor: number
	verify?: boolean
	skipGit?: boolean
	release?: string
	agent?: Agent
	build?: Task | Task[]
	test?: Task | Task[]
	beforeInstall?: Task | Task[]
	beforeBuild?: Task | Task[]
	beforeTest?: Task | Task[]
}

type Task = string | { script: string; args?: string[] } | (() => Promise<any>)

export interface CommandOptions {
	suites?: string[]
	repo?: string
	branch?: string
	tag?: string
	commit?: string
	release?: string
	verify?: boolean
	skipGit?: boolean
}

export interface RepoOptions {
	repo: string
	dir?: string
	branch?: string
	tag?: string
	commit?: string
	shallow?: boolean
	overrides?: Overrides
}

export interface Overrides {
	[key: string]: string | boolean
}

export interface ProcessEnv {
	[key: string]: string | undefined
}

interface DependencyInfo {
	from: string
	version: string
	resolved: string
	path: string
}
interface PackageInfo {
	name: string
	version: string
	path: string
	private: boolean
	dependencies: Record<string, DependencyInfo>
	devDependencies: Record<string, DependencyInfo>
	optionalDependencies: Record<string, DependencyInfo>
}
