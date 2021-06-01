import React, { useState } from 'react';

const colorByType = {
  string: 'green',
  u8: 'blue',
  u16: 'blue',
  u32: 'blue',
  u64: 'blue',
  u128: 'blue',
  i8: 'blue',
  i16: 'blue',
  i32: 'blue',
  i64: 'blue',
  f32: 'blue',
  f64: 'blue',
  bool: 'yellow',
  void: 'pink'
}

export default function ContractFunction({ addLog, fn, account }) {
  const [loading, setLoading] = useState(false);

  const handleSubmit = event => {
    event.preventDefault();
    setLoading(true);
    const fd = new FormData(event.target);

    account.functionCall({
      contractId: account.accountId,
      methodName: fn.name,
      args: Object.fromEntries(fd.entries()),
    })
      .then(({ receipts_outcome, transaction_outcome, status }) => {
        receipts_outcome.forEach(({ outcome }) => {
          outcome.logs.forEach(log => addLog({ level: 'info', text: `[${fn.name}] ${log}`}));
        });

        addLog({
          level: 'success',
          text: `[${fn.name}] ${status.SuccessValue ? Buffer.from(status.SuccessValue, 'base64').toString() : ''}`
        });
      })
      .finally(() => setLoading(false))
  }
  return (
    <>
      <div className="flex justify-center">
        <p className="inline-flex bg-purple-600 text-white rounded-full h-8 px-3 m-auto justify-center items-center text-center">{fn.name}</p>
        <p className={`inline-flex bg-${colorByType[fn.returnType] || 'gray'}-600 text-white rounded-full h-8 px-3 m-auto justify-center items-center text-center`}>{fn.returnType}</p>
      </div>
      <form onSubmit={handleSubmit}>
        {fn.params.map((param) => (
          <fieldset key={param.name} className="p-2 my-2">
            <label className={`ring ring-${colorByType[param.type] || 'gray'}-500 w-1/4 inline-block bg-white p-1 rounded-l`}>{param.name}</label>
            <input className={`ring ring-${colorByType[param.type] || 'gray'}-500 w-3/4 p-1 rounded-r`} type="text" name={param.name} placeholder={param.type} />
          </fieldset>
        ))}
        <button disabled={loading} className={`${loading ? 'animate-pulse' : ''} block bg-blue-500 w-full rounded p-2 my-2`}>Run</button>
      </form>
    </>
  );
}
