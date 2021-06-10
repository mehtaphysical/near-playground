import { Program } from 'assemblyscript';
import { Transform } from 'assemblyscript/cli/transform';
import { ASTBuilder } from 'visitor-as/dist';

export default () => {
  const abi = [];
  class ABITransformer extends Transform {
    afterInitialize(program: Program): void {
      const input = program.filesByName.get('input');

      for (const [name, wrapped] of input.exports?.entries()) {
        const original = input.members.get(
          wrapped.name.replace('__wrapper_', '')
        );

        const params = original.declaration.signature.parameters.map(
          (param) => {
            const [name, type] = ASTBuilder.build(param).split(':');
            return { name: name.trim(), type: type.trim() };
          }
        );
        const returnType = ASTBuilder.build(
          original.declaration.signature.returnType
        );

        abi.push({ params, returnType, name });
      }
    }
  }

  return {
    ABITransformer,
    abi,
  };
};
