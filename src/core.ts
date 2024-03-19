import {debug, getInput, info, setFailed, warning} from "@actions/core"
import {Inputs, Outputs} from "./main";

// @ts-ignore
const tag = (prefix: string) => `${prefix.padEnd(9)} |`

export function run(input: Inputs): Outputs {
    let env = {};
    try {
        info(`${tag("🟡 QUEUE")} read file content`);
        env = JSON.parse(getInput(input?.file ?? "env", {required: true}));
        if (input.debug) {
            console.log('env=', env);
        }
    } catch (error) {
        if (error instanceof Error) {
            setFailed(`${tag("🔴 ERROR")} ${error.message}`)
        }
        return;
    }
    return {
        ...env
    };
}
