import * as dotenv from "dotenv"
import { GitHubRepo } from "./types"

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

async function main() {
	try {
		// Fetch all public repos in the org
		const allRepos = await fetchAllPublicRepos()
		console.log(`Fetched ${allRepos.length} public repos from ${ORG_NAME}.\n`)
	} catch (error) {
		console.error("Error in main:", error)
		process.exit(1)
	}
}

main()
	.then(() => console.log("Script completed."))
	.catch((err) => console.error(err))
