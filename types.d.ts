// eslint-disable-next-line n/no-unpublished-import
import type { Agent } from '@antfu/ni'
export interface EnvironmentData {
	root: string
	workspace: string
	nxPath: string
	cwd: string
	env: ProcessEnv
}

export interface RunOptions {
	workspace: string
	root: string
	nxPath: string
	nxMajor: number
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

type Task = string | (() => Promise<any>)

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
