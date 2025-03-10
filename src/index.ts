import { writeFileSync } from "fs"
import * as dotenv from "dotenv"
import { GitHubCollaborator, GitHubRepo } from "./types"

dotenv.config()

const GITHUB_TOKEN = process.env.GITHUB_TOKEN
if (!GITHUB_TOKEN) {
	console.error("Error: Please set GITHUB_TOKEN in your environment variables.")
	process.exit(1)
}

const ORG_NAME = "elizaOS-plugins"
const PER_PAGE = 100 // Maximum items per page from GitHub

/**
 * Fetch all public repositories from github.
 */
async function fetchAllPublicRepos(): Promise<GitHubRepo[]> {
	let page = 1
	let allRepos: GitHubRepo[] = []

	while (true) {
		const url = `https://api.github.com/orgs/${ORG_NAME}/repos?type=public&per_page=${PER_PAGE}&page=${page}`
		const resp = await fetch(url, {
			headers: {
				Authorization: `token ${GITHUB_TOKEN}`,
				Accept: "application/vnd.github.v3+json",
			},
		})

		if (!resp.ok) {
			throw new Error(`Failed to fetch repos (page ${page}): ${resp.status}`)
		}

		const repos = (await resp.json()) as GitHubRepo[]
		if (repos.length === 0) {
			break // No more repos
		}

		allRepos = allRepos.concat(repos)

		// If we got less than PER_PAGE, it's the final page
		if (repos.length < PER_PAGE) {
			break
		}

		page++
	}

	return allRepos
}

/**
 * Fetch all collaborators for a given repository.
 */
async function fetchAllCollaborators(repoName: string): Promise<GitHubCollaborator[]> {
	let page = 1
	let allCollabs: GitHubCollaborator[] = []

	while (true) {
		const url = `https://api.github.com/repos/${ORG_NAME}/${repoName}/collaborators?affiliation=outside&per_page=${PER_PAGE}&page=${page}`
		const resp = await fetch(url, {
			headers: {
				Authorization: `token ${GITHUB_TOKEN}`,
				Accept: "application/vnd.github.v3+json",
			},
		})

		if (resp.status === 404) {
			// Skip, prob new or empty repo, or if the user doesn't have permission
			console.warn(`404 on ${repoName} – skipping (may not have collaborator access).`)
			break
		}

		if (!resp.ok) {
			// Token may not have "repo" scope, or if it's a private repo
			throw new Error(`Failed to fetch collaborators for ${repoName}: ${resp.status}`)
		}

		const collaborators = (await resp.json()) as GitHubCollaborator[]
		if (collaborators.length === 0) {
			break
		}

		allCollabs = allCollabs.concat(collaborators)

		if (collaborators.length < PER_PAGE) {
			break
		}

		page++
	}

	return allCollabs
}

async function main() {
	try {
		// Fetch all public repos in the org
		const allRepos = await fetchAllPublicRepos()
		console.log(`Fetched ${allRepos.length} public repos from ${ORG_NAME}.\n`)

		// Prepare CSV lines (headers first)
		const csvRows: string[] = ["Repository Name,Has Maintainers?,Current Maintainers,Repository URL"]

		// For each repo, fetch collaborators, filter to maintainers
		console.log("Fetching all collaborators...")
		for (const repo of allRepos) {
			const repoName = repo.name
			const collaborators = await fetchAllCollaborators(repoName)
			// console.log(collaborators)

			// Filter to those who have "maintain" permission
			const maintainers = collaborators.filter((c) => c.permissions && c.permissions.maintain === true)
			const maintainersList = maintainers.map((m) => m.login).join("; ")

			const row = `"${repoName}","${maintainers.length > 0}","${maintainersList}","${repo.html_url}"`
			csvRows.push(row)
		}

		// Write out to CSV
		const csvContent = csvRows.join("\n")
		writeFileSync("maintainers.csv", csvContent, "utf8")
	} catch (error) {
		console.error("Error in main:", error)
		process.exit(1)
	}
}

main()
	.then(() => console.log("Completed! Check 'maintainers.csv' for the list of repos + maintainers."))
	.catch((err) => console.error(err))
