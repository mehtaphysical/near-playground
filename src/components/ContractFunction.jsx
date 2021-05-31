import React from 'react';

export default function ContractFunction({ fn }) {
  return (
    <>
      <p>Name: {fn.name}</p>
      <p>Returns: {fn.returnType}</p>
      <form>
        {fn.params.map((param) => (
          <>
            <label>
              {param.name}
              <input type="text" placeholder={param.type} />
            </label>
          </>
        ))}
        <button>Run</button>
      </form>
    </>
  );
}
