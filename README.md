# **Eliza Plugins Monitor**

A **TypeScript-based tool** for monitoring repositories in the [elizaOS-plugins](https://github.com/elizaOS-plugins) organization.  
It **automates maintainer tracking**, making it easier to identify and manage maintainers for each repository.

## **How to Use**

### **1. Clone the repository**

```sh
git clone https://github.com/shakkernerd/eliza-plugins-monitor.git
cd eliza-plugins-monitor
```

### **2. Install dependencies**

```sh
pnpm install
```

### **3. Set up GitHub authentication**

Create a `.env` file in the project root and add your **GitHub Personal Access Token** (classic):

```sh
GITHUB_TOKEN=your_github_personal_access_token
```

> Your token should have **repo read permissions** to fetch repository and collaborator details.

### **4. Run the monitor**

```sh
pnpm run start
```

This executes the script using `ts-node` to fetch repos and generate `maintainers.csv`.

## **Output**

After execution, the script generates a **CSV file** with the following format:

| Repository Name | Has Maintainers? | Current Maintainers | Open Issues | Repository URL |
| --------------- | ---------------- | ------------------- | ----------- | -------------- |
| repo-1          | true             | name(s)             | 1           | https://       |

`...`

## **License**

This project is licensed under the **MIT License**. See the [LICENSE](LICENSE) file for details.
