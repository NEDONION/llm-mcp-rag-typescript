import chalk from "chalk";
import fs from 'fs/promises';
import path from 'path';


export function logTitle(message: string) {
    const totalLength = 80;
    const messageLength = message.length;
    const padding = Math.max(0, totalLength - messageLength - 4); // 4 for the "=="
    const paddedMessage = `${'='.repeat(Math.floor(padding / 2))} ${message} ${'='.repeat(Math.ceil(padding / 2))}`;
    console.log(chalk.bold.cyanBright(paddedMessage));
}

export async function loadPrompt(promptName: string): Promise<string> {
    const promptPath = path.join(__dirname, '..', 'prompts', promptName);
    return fs.readFile(promptPath, 'utf-8');
}
