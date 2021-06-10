import React, { useState } from 'react';

const ringColorByType = {
  string: 'ring-green-500',
  u8: 'ring-blue-500',
  u16: 'ring-blue-500',
  u32: 'ring-blue-500',
  u64: 'ring-blue-500',
  u128: 'ring-blue-500',
  i8: 'ring-blue-500',
  i16: 'ring-blue-500',
  i32: 'ring-blue-500',
  i64: 'ring-blue-500',
  f32: 'ring-blue-500',
  f64: 'ring-blue-500',
  bool: 'ring-yellow-500',
  void: 'ring-pink-500',
};

const bgColorByType = {
  string: 'bg-green-500',
  u8: 'bg-blue-500',
  u16: 'bg-blue-500',
  u32: 'bg-blue-500',
  u64: 'bg-blue-500',
  u128: 'bg-blue-500',
  i8: 'bg-blue-500',
  i16: 'bg-blue-500',
  i32: 'bg-blue-500',
  i64: 'bg-blue-500',
  f32: 'bg-blue-500',
  f64: 'bg-blue-500',
  bool: 'bg-yellow-500',
  void: 'bg-pink-500',
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
          className={`inline-flex ${
            bgColorByType[fn.returnType] || 'bg-gray-500'
          } text-white rounded-full h-8 px-3 m-auto justify-center items-center text-center`}
        >
          {fn.returnType}
        </p>
      </div>
      <form onSubmit={handleSubmit}>
        {fn.params.map((param) => (
          <fieldset key={param.name} className="p-2 my-2">
            <label
              className={`ring ${
                ringColorByType[param.type] || 'ring-gray-500'
              } w-1/4 inline-block bg-white p-1 rounded-l`}
            >
              {param.name}
            </label>
            <input
              className={`ring ${
                ringColorByType[param.type] || 'ring-gray-500'
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
