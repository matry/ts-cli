
declare module 'tree-sitter-matry'

const enum Method {
  Identity = 'IDENTITY',
  Dimension = 'DIMENSION',
  Ref = 'REF',
  Eq = 'EQ',
  Neq = 'NEQ',
  Rgb = 'RGB',
  Hsl = 'HSL',
  Lighten = 'LIGHTEN',
  Darken = 'DARKEN',
  Saturate = 'SATURATE',
  Desaturate = 'DESATURATE',
  Arithmetic = 'ARITHMETIC',
}

const enum ValueType {
  Text = 'TEXT',
  Number = 'NUMBER',
  Color = 'COLOR',
  Bool = 'BOOL',
  Asset = 'ASSET',
}

const enum ArithmeticOperator {
  Mult = 'MULT',
  Sum = 'SUM',
  Sub = 'SUB',
  Mod = 'MOD',
}

interface FunctionExpression {
  method: Method
  return_type: ReturnType
  parameters: (string|number|ArithmeticOperator|FunctionExpression)[]
}
