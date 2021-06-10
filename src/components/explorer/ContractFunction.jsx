import React, { useState } from 'react';

const colorByType = {
  string: 'ring-green',
  u8: 'ring-blue',
  u16: 'ring-blue',
  u32: 'ring-blue',
  u64: 'ring-blue',
  u128: 'ring-blue',
  i8: 'ring-blue',
  i16: 'ring-blue',
  i32: 'ring-blue',
  i64: 'ring-blue',
  f32: 'ring-blue',
  f64: 'ring-blue',
  bool: 'ring-yellow',
  void: 'ring-pink',
};

export default function ContractFunction({ addLog, fn, account }) {
  const [loading, setLoading] = useState(false);

  const handleSubmit = (event) => {
    event.preventDefault();
    setLoading(true);
    const fd = new FormData(event.target);

    account
      .functionCall({
        contractId: account.accountId,
        methodName: fn.name,
        args: Object.fromEntries(fd.entries()),
      })
      .then(({ receipts_outcome, transaction_outcome, status }) => {
        receipts_outcome.forEach(({ outcome }) => {
          outcome.logs.forEach((log) =>
            addLog({ level: 'info', text: `[${fn.name}] ${log}` })
          );
        });

        addLog({
          level: 'success',
          text: `[${fn.name}] ${
            status.SuccessValue
              ? Buffer.from(status.SuccessValue, 'base64').toString()
              : ''
          }`,
        });
      })
      .finally(() => setLoading(false));
  };
  return (
    <>
      <div className="flex justify-center">
        <p className="inline-flex bg-purple-600 text-white rounded-full h-8 px-3 m-auto justify-center items-center text-center">
          {fn.name}
        </p>
        <p
          className={`inline-flex bg-${
            colorByType[fn.returnType] || 'gray'
          }-600 text-white rounded-full h-8 px-3 m-auto justify-center items-center text-center`}
        >
          {fn.returnType}
        </p>
      </div>
      <form onSubmit={handleSubmit}>
        {fn.params.map((param) => (
          <fieldset key={param.name} className="p-2 my-2">
            <label
              className={`ring ${
                colorByType[param.type] || 'gray-500'
              } w-1/4 inline-block bg-white p-1 rounded-l`}
            >
              {param.name}
            </label>
            <input
              className={`ring ${
                colorByType[param.type] || 'gray-500'
              } w-3/4 p-1 rounded-r`}
              type="text"
              name={param.name}
              placeholder={param.type}
            />
          </fieldset>
        ))}
        <button
          disabled={loading}
          className={`${
            loading ? 'animate-pulse' : ''
          } block bg-blue-500 text-white w-full rounded p-2 my-2`}
        >
          Run
        </button>
      </form>
    </>
  );
}
