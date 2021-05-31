import React, { useState, useEffect } from 'react';
import AceEditor from 'react-ace';
import { Near, WalletConnection, Account } from 'near-api-js';
import { BrowserLocalStorageKeyStore } from 'near-api-js/lib/key_stores';
import fs from '../../fs.json';
import asc from 'assemblyscript/dist/asc';
import includeBytes from 'visitor-as/dist/examples/includeBytesTransform.js';
import bindgen from 'near-sdk-bindgen';
import exportAs from 'visitor-as/dist/examples/exportAs.js';
import exporter from '../../Exports';

import 'ace-builds/src-noconflict/mode-typescript';
import 'ace-builds/src-noconflict/theme-monokai';
import ContractFunction from '../ContractFunction';

function App() {
  const [input, setInput] = useState(
    `
import { Context, PersistentMap } from "near-sdk-as";

const statuses = new PersistentMap<string, string>("s");

export function setStatus(text: string): void {
  statuses.set(Context.sender, text);
}

export function getStatus(): string {
  return statuses.getSome(Context.sender);
}
`.trim()
  );

  const [compiled, setCompiled] = useState(input);
  const [exported, setExported] = useState([]);
  const [binary, setBinary] = useState([]);
  const [error, setError] = useState(null);

  const near = new Near({
    keyStore: new BrowserLocalStorageKeyStore(),
    nodeUrl: 'https://rpc.testnet.near.org',
    networkId: 'testnet',
    walletUrl: 'https://wallet.testnet.near.org',
  });

  const wallet = new WalletConnection(near, 'near-playground');
  const account = new Account(near.connection, 'rnm.testnet');

  useEffect(() => {
    asc.ready.then(() => {
      const { Transformer, exported } = exporter();
      const stdout = asc.createMemoryStream();
      const stderr = asc.createMemoryStream();

      const out = {};
      const sources = { 'input.ts': compiled, ...fs };
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
          transforms: [includeBytes, Transformer, bindgen, exportAs],
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
          if (err) setError(stderr.toString());
          else setError(null);
        }
      );
      setExported(exported);
      setBinary(out.binary);
      account.deployContract(out.binary);

    });
  }, [compiled]);

  if (!wallet.isSignedIn()) {
    wallet.requestSignIn();
    return null;
  }

  return (
    <section style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
      <section>
        <button onClick={() => setCompiled(input)}>Compile</button>
        <AceEditor
          onChange={setInput}
          value={input}
          mode="typescript"
          theme="monokai"
        />
        {error && <pre>{error}</pre>}
      </section>
      <section>
        {exported.map((fn) => (
          <ContractFunction fn={fn} />
        ))}
      </section>
    </section>
  );
}

export default App;
