import {run} from "./core";
import * as core from "@actions/core";

export interface Inputs {
    debug?: boolean;
    file?: string;
    owner?: string;
    repo?: string;
    branch?: string;
    token?: string;
}

export interface Outputs {
    // ..
    [key: string]: any
}

let getInput = (): Inputs => ({
    debug: core.getInput('debug') === 'true'
})

let handleOutput = (output: Outputs = {}) => {
    Object.keys(output).forEach((key) => core.setOutput(key, output[key]));
    debugPrintf('输出变量: ', output);
};

export function debugPrintf(...args: any) {
    if (getInput().debug) {
        console.log(...args);
    }
}

(async () => {
    try {
        handleOutput((await run(getInput())))
    } catch (error: any) {
        core.setFailed(error?.message);
    }
})();
