import {info, warning, getInput} from "@actions/core";
import * as github from '@actions/github';
import {Inputs, Outputs} from "./main";


const octokit = github.getOctokit(process.env.GITHUB_TOKEN);
const tag = (prefix: string) => `${prefix.padEnd(9)} |`

async function getFileContents(branch: string, owner: string, repo: string, filepath: string): Promise<any | undefined> {
    try {
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

async function getBranch(branch: string, repo: string): Promise<string> {
    if (branch) {
        return Promise.resolve(branch);
    }
    const {data} = await octokit.rest.repos.get(repo);
    return data.default_branch;
}

export async function run(input: Inputs): Promise<Outputs> {
    const crepo = github.context.repo;
    let env = {};
    let file = input?.file?.trim();
    file = file?.length ? file : ".github/workflows/env.json";

    let owner: string = input?.owner?.trim() ?? crepo.owner;
    owner = owner?.length ? owner : crepo.owner;

    let repo = input?.repo?.trim() ?? crepo.repo;
    repo = repo?.length ? repo : crepo.repo;

    let _branch = input.branch?.trim() ?? github.context.ref;
    _branch = _branch?.length ? _branch : github.context.ref;

    const branch = await getBranch(_branch, repo);

    info(`${tag("🟡 QUEUE")} read file content`);

    let currentFile = await getFileContents(branch, owner, repo, file);
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
