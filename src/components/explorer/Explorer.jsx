import React from 'react';
import ContractFunction from './ContractFunction';

export default function Explorer({ className, abi, addLog, account }) {
  return (
    <ul className={`flex flex-wrap ${className}`}>
      {abi.map((fn) => (
        <li key={fn.name} className="w-60 p-4">
          <ContractFunction addLog={addLog} fn={fn} account={account} />
        </li>
      ))}
    </ul>
  )
}
