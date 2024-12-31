/* Copyright 2018 Mozilla Foundation
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */
import { CompilerService, ServiceInput, ServiceOutput, Language, InputFile } from "./types";
import { sendRequestJSON, ServiceTypes } from "./sendRequest";
import { decodeBinary } from "./utils";
import { StringDecoder } from "string_decoder";

interface IFileContent {
  name: string;
  data?: string;
  type?: "text" | "binary";
}

interface TaskResult {
  commandLine: string;

  stdout: string;

  success: boolean;
}

interface SourceFile {
  /** the name of source file */
  name: string;
  /** source file content */
  content: string;

  format?: string;
}

type Response = {
  tasks: TaskResult[];

  output: SourceFile[];
};

export class EmscriptenService implements CompilerService {

  async compile(input: ServiceInput): Promise<ServiceOutput> {
    const files = Object.values(input.files);
    const inputFile = Object.keys(input.files);
    const compiledFiles = [];

    for (let i = 0; i < inputFile.length; i++) {
      compiledFiles.push({
        name: inputFile[i],
        content: files[i].content,
      });
    }

    const options: string = input.options;

    const project = {
      files: compiledFiles,
      compileOptions: options.split(" "),
      linkOptions: options.split(" "),
    };
    const result = await sendRequestJSON(project, ServiceTypes.Emscripten) as unknown as Response;
    const items: any = {};
    const success = result.output.length > 0;

    if (success) {
      const wasm = result.output.filter(i => i.name == "a.wasm")[0];
      const content = await decodeBinary(wasm.content);
      items["a.wasm"] = { content };
    }

    // const findInputFileFromFileName = (fileName: string): string => {
    //   const maybeFileRef = inputFile.filter(x => x.indexOf(fileName) >= 0);
    //   if (maybeFileRef.length > 0) {
    //     return maybeFileRef[0];
    //   } else {
    //     return "";
    //   }
    // };

    let stdout = "";

    if (result.tasks) {
      for (const task of result.tasks) {
        stdout += task.stdout;
      }
    }

    return {
      success: success,
      console: stdout,
      items,
    };
  }
}
