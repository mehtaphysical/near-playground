import React, { useEffect, useState } from 'react';
import { Near, Account, KeyPair } from 'near-api-js';
import Editor from '../editor/Editor';
import Explorer from '../explorer/Explorer';

const NEAR_PLAYGROUND_CONTRACT_ID_KEY = 'near-playground-contract-id';
const NEAR_PLAYGROUND_KEY_PAIR_KEY = 'near-playground-pair';

const levelToColor = {
  info: 'white',
  error: 'red',
  warn: 'yellow',
  success: 'green',
};

function App() {
  const [abi, setAbi] = useState([]);
  const [logs, setLogs] = useState([]);
  const [contractId, setContractId] = useState(
    localStorage.getItem(NEAR_PLAYGROUND_CONTRACT_ID_KEY)
  );

  const keyStore = {
    getKey() {
      return KeyPair.fromString(
        localStorage.getItem(NEAR_PLAYGROUND_KEY_PAIR_KEY)
      );
    },
    setKey() {},
  };

  const near = new Near({
    keyStore,
    nodeUrl: 'https://rpc.testnet.near.org',
    networkId: 'testnet',
    walletUrl: 'https://wallet.testnet.near.org',
    helperUrl: 'https://helper.testnet.near.org',
  });

  const account = new Account(near.connection, contractId);

  useEffect(async () => {
    if (!localStorage.getItem(NEAR_PLAYGROUND_KEY_PAIR_KEY)) {
      const keypair = KeyPair.fromRandom('ed25519');
      const newContractId = `near-playground-${Math.ceil(
        Math.random() * 1000000000
      )}.testnet`;

      await near.createAccount(newContractId, keypair.getPublicKey());

      localStorage.setItem(NEAR_PLAYGROUND_CONTRACT_ID_KEY, newContractId);
      localStorage.setItem(NEAR_PLAYGROUND_KEY_PAIR_KEY, keypair.toString());

      setContractId(newContractId);
    }
  }, []);

  if (!contractId) {
    return null;
  }

  const handleCompile = ({ abi, binary }) => {
    setAbi(abi);
    account.deployContract(binary);
  };

  const addLog = (log) => {
    setLogs((prevLogs) => [...prevLogs, log]);
  };

  return (
    <section className="grid grid-cols-2 gap-5 h-full">
      <Editor
        className="h-full border"
        addLog={addLog}
        onCompiled={handleCompile}
      />
      <section className="grid grid-rows-2 grid-flow-row">
        <Explorer
          className="col-span-1"
          abi={abi}
          addLog={addLog}
          account={account}
        />
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
