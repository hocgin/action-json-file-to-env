import {info, warning} from "@actions/core";
import * as github from '@actions/github';
import {Inputs, Outputs} from "./main";


const tag = (prefix: string) => `${prefix.padEnd(9)} |`

async function getFileContents(branch: string, owner: string, repo: string, filepath: string, token: string): Promise<any | undefined> {
    try {
        const octokit = github.getOctokit(token);
        const body = {owner, repo, ref: branch, path: filepath}
        info(`👉 ${JSON.stringify(body, null, 2)}`);
        const {data} = await octokit.rest.repos.getContent(body);
        return data;
    } catch (err) {
        warning(`👉 Get File Contents: ${err instanceof Error ? err.message : err}`);
        return;
    }
}

function nodeBase64ToUtf8(data: string) {
    // @ts-ignore
    return Buffer.from(data, "base64").toString("utf-8");
}

async function getBranch(branch: string, repo: string, token: string): Promise<string> {
    const octokit = github.getOctokit(token);
    if (branch) {
        return Promise.resolve(branch);
    }
    const {data} = await octokit.rest.repos.get(repo);
    return data.default_branch;
}

export async function run(input: Inputs): Promise<Outputs> {
    // @ts-ignore
    const crepo = github.context.repo;
    let env = {};
    let file = input?.file ?? "env";
    let owner: string = input?.owner ?? crepo.owner;
    let repo = input?.repo ?? crepo.repo;
    let token = input?.token ?? process.env.GITHUB_TOKEN;

    const branch = await getBranch((input.branch ?? github.context.ref), repo, token);

    info(`${tag("🟡 QUEUE")} read file content`);

    let currentFile = await getFileContents(branch, owner, repo, file, token);
    if (currentFile && 'content' in currentFile) {
        const fileContent = nodeBase64ToUtf8(currentFile.content || '');
        env = JSON.parse(fileContent);
        if (input?.debug) {
            console.log('env=', env);
        }
    }
    return {
        ...env
    };
}
