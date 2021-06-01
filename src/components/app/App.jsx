import React, { useState } from 'react';
import { Near, Account, KeyPair } from 'near-api-js';
import Editor from '../editor/Editor';
import Explorer from '../explorer/Explorer';

const levelToColor = {
  info: 'white',
  error: 'red',
  warn: 'yellow',
  success: 'green'
}

function App() {
  const [abi, setAbi] = useState([]);
  const [logs, setLogs] = useState([]);

  const keyStore = {
    getKey() {
      return KeyPair.fromString(window.localStorage.getItem('near-playground-pair'));
    },
    setKey() {

    }
  }

  const near = new Near({
    keyStore,
    nodeUrl: 'https://rpc.testnet.near.org',
    networkId: 'testnet',
    walletUrl: 'https://wallet.testnet.near.org',
  });

  const account = new Account(near.connection, 'rnm.testnet');

  if (!localStorage.getItem('near-playground-pair')) {
    const keypair = KeyPair.fromRandom('ed25519');
    window.localStorage.setItem('near-playground-pair', keypair.toString());
    window.location.assign(`https://wallet.testnet.near.org/login?public_key=${keypair.getPublicKey()}&success_url=http://localhost:1234`)
    return null;
  }

  const handleCompile = ({ abi, binary }) => {
    setAbi(abi);
    account.deployContract(binary);
  }

  const addLog = (log) => {
    setLogs(prevLogs => [...prevLogs, log]);
  }

  return (
    <section className="grid grid-cols-2 gap-5 h-full">
      <Editor className="h-full border" addLog={addLog} onCompiled={handleCompile} />
      <section className="grid grid-rows-2 grid-flow-row">
        <Explorer className="col-span-1" abi={abi} addLog={addLog} account={account} />
        <section className="text-white col-span-1 h-full overflow-scroll">
          {logs.map(({ level, text }) => (
            <pre className={`text-${levelToColor[level]}-500`}>
              {level.toUpperCase()}: {text}
            </pre>
          ))}
        </section>
      </section>
    </section>
  );
}

export default App;
