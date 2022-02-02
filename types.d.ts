export interface EnvironmentData {
	root: string
	workspace: string
	vitePath: string
	cwd: string
	env: ProcessEnv
}

export interface RunOptions {
	workspace: string
	root: string
	vitePath: string
	verify: boolean
	skipGit: boolean
	build?: Task
	test?: Task
}

type Task = string | (() => Promise<any>)

export interface CommandOptions {
	suites?: string[]
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
	[key: string]: string
}

export interface ProcessEnv {
	[key: string]: string | undefined
}
