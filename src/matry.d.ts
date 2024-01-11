
declare module 'tree-sitter-matry'

interface MatryTokenDeclaration {
  type: string,
  id: string,
  name: string,
  declared_value: any,
}

interface MatryTokenAssignment {
  id: string,
  name: string,
  declared_value: any,
}

interface MatryBundleFragment {
  token_declarations: {[key: string]: MatryTokenDeclaration}
  token_assignments: {[key: string]: MatryTokenAssignment}
}

interface MatryBundle extends MatryBundleFragment {
  matry_version: string
  version: string
}
