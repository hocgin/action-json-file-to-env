import {debug, getInput, info, setFailed, warning} from "@actions/core";
import {context, getOctokit} from '@actions/github';
import {GetResponseTypeFromEndpointMethod} from '@octokit/types';
import {Inputs, Outputs} from "./main";


// @ts-ignore
const crepo = github.context;

// @ts-ignore
export const octokit = getOctokit(process.env.GITHUB_TOKEN!);

type GetContentResponseType = GetResponseTypeFromEndpointMethod<typeof octokit.rest.repos.getContent>['data'];

// @ts-ignore
const tag = (prefix: string) => `${prefix.padEnd(9)} |`

async function getFileContents(branch: string, owner?: string, repo?: string, filepath?: string): Promise<GetContentResponseType | undefined> {
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

async function getBranch(branch?: string): Promise<string> {
    if (branch) {
        return Promise.resolve(branch);
    }
    const {data} = await octokit.rest.repos.get(context.repo);
    return data.default_branch;
}

export async function run(input: Inputs): Promise<Outputs> {
    let env = {};
    const branch = await getBranch(input?.branch);
    let file = input?.file ?? "env";
    let owner = input?.owner ?? crepo?.owner;
    let repo = input?.repo ?? crepo?.repo;

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
