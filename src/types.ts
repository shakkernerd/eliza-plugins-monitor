// GitHub Repo API response
export interface GitHubRepo {
	name: string
	html_url: string
	archived: boolean
}

export interface GitHubCollaborator {
	login: string
	permissions?: {
		admin?: boolean
		maintain?: boolean
		push?: boolean
		pull?: boolean
	}
}
