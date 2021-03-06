import React, { useState, useEffect } from 'react';
import { BarLoader } from 'react-spinners';
import AceEditor from 'react-ace';

import asc from 'assemblyscript/dist/asc';
import includeBytes from 'visitor-as/dist/examples/includeBytesTransform.js';
import bindgen from 'near-sdk-bindgen';
import exportAs from 'visitor-as/dist/examples/exportAs.js';
import createABITransformer from './ABITransformer';

import 'ace-builds/src-noconflict/mode-typescript';
import 'ace-builds/src-noconflict/theme-monokai';

export default function Editor({ className, addLog, onCompiled }) {
  const [input, setInput] = useState(
    `
import { Context, PersistentMap, logging } from "near-sdk-as";

const statuses = new PersistentMap<string, string>("s");

export function setStatus(text: string): void {
  statuses.set(Context.sender, text);
}

export function getStatus(): string {
  logging.log('Getting Status');
  return statuses.getSome(Context.sender);
}
`.trim()
  );
  const [compiled, setCompiled] = useState(input);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([import('../../fs.json'), asc.ready])
      .then(([dependencies]) => {
        const { ABITransformer, abi } = createABITransformer();
        const stdout = asc.createMemoryStream();
        const stderr = asc.createMemoryStream();

        const out = {};
        const sources = { 'input.ts': compiled, ...dependencies };
        asc.main(
          [
            '--runtime',
            'stub',
            '--binaryFile',
            'binary',
            '--textFile',
            'text',
            '--lib',
            'node_modules/near-skd-as/assembly/json.lib.ts',
            'node_modules/near-sdk-bindgen/assembly/index.ts',
            'input.ts',
          ],
          {
            stdout,
            stderr,
            transforms: [includeBytes, bindgen, ABITransformer, exportAs],
            readFile: (name) => {
              if (name.includes('json.lib.ts')) {
                return sources['node_modules/near-sdk-as/assembly/json.lib.ts'];
              }
              const filePath = name.includes('node_modules')
                ? name.slice(name.lastIndexOf('node_modules'))
                : name;
              return Object.prototype.hasOwnProperty.call(sources, filePath)
                ? sources[filePath]
                : null;
            },
            writeFile: (name, contents) => {
              out[name] = contents;
            },
            listFiles: () => [],
          },
          (err) => {
            if (err) addLog({ level: 'error', text: stderr.toString() });
            else addLog({ level: 'success', text: 'Compilation Successful' });
          }
        );
        onCompiled({ abi, binary: out.binary });
      })
      .finally(() => setLoading(false));
  }, [compiled]);

  return (
    <>
      {loading && (
        <BarLoader
          css="position: absolute"
          height={2}
          width="100vw"
          color="#6366F1"
        />
      )}
      <section className={className}>
        <button
          className="bg-green-500 text-white rounded p-2 block mr-0 ml-auto"
          onClick={() => setCompiled(input)}
        >
          Compile
        </button>
        <AceEditor
          style={{ background: '#151515' }}
          width="100%"
          height="100%"
          fontSize="1rem"
          tabSize={2}
          onChange={setInput}
          value={input}
          mode="typescript"
          theme="monokai"
        />
      </section>
    </>
  );
}
