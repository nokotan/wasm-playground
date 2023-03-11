
import { buildExtension, downloadExternalRepository } from "./download/extension";
import { replaceFileContent } from "./util";
import { downloadAndUnzipVSCode } from "./download/vscode";
import { promises as fs } from "fs";



async function main() {

    await downloadAndUnzipVSCode("stable");

    await patchVSCode();

    await deployExtensions();

    await copyStaticAssets();
}

async function deployExtensions() {

    await downloadExternalRepository("https://github.com/lostintangent/gistpad.git");
    await downloadExternalRepository("https://github.com/nokotan/wasmer-terminal.git");

    await buildExtension("wasm-playground");
    await buildExtension("emscripten-remote-build");
    // await buildExtension("gistpad", {
    //     vsceOptions: [ "" ],
    //     projectName: "gistfs"
    // });
    await buildExtension("wasmer-terminal", {
        vsceOptions: [ "--no-dependencies" ],
        projectName: "wasmer-term"
    });
}

async function patchVSCode() {

    await replaceFileContent(
        "vscode/vscode-web/extensions/github-authentication/dist/browser/extension.js", 
        [ 
            { pattern: "/(?:^|\\.)github\\.dev$/", replaced: "/(?:^|\\.)kamenokosoft\\.com$/" },
            { pattern: /https:\/\/vscode.dev\/redirect/g, replaced: "https://wasm-playground.kamenokosoft.com/callback" },
            { pattern: "01ab8ac9400c4e429b23", replaced: "49ba0b7a0fa218f5973a" },   
        ]
    );
}

async function copyStaticAssets() {

    const copiedFiles = [
        "index.html",
        "callback.html",
        "manifest.json",
        "config.js",
        "sw.js",
    ];

    for (const file of copiedFiles) {
        await fs.copyFile(`src/${file}`, "vscode/vscode-web/" + file);
    }
}

main();
