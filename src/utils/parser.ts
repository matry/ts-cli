import Parser, { SyntaxNode, Tree } from 'tree-sitter'
import Matry from 'tree-sitter-matry'
import { parseTokenConditionalBlock, parseTokenDeclaration } from './tokens.js'
import receivers from '../ast/receivers.js'

const parser = new Parser()
parser.setLanguage(Matry)

function processor(node: SyntaxNode) {
  const key: string = `${node.type}_node`
  const receiver = receivers[key]

  if (typeof receiver === 'function') {
    return receiver(node, processor)
  }

  return null
}

export function parseMatryFile(source: string) {
  const tree: Tree = parser.parse(source)

  // const bundle: MatryBundle = {
  //   matry_version: '0.0.0',
  //   version: '1.0.0', // todo - how to make this dynamic
  //   token_declarations: {},
  //   token_assignments: {},
  // }

  return processor(tree.rootNode)
}

export function parseNode(node: SyntaxNode, bundle: any): void {
  if (node.type === 'token_declaration') {
    parseTokenDeclaration(node, bundle)
  } else if (node.type === 'conditional_token_block') {
    parseTokenConditionalBlock(node, bundle)
  } else {
    for (const child of node.namedChildren) {
      if (child.type === 'ERROR') { // child.hasError()
        console.error(`at line ${child.startPosition.row + 1}, column ${child.startPosition.column}`)
      }

      parseNode(child, bundle)
    }
  }
}

export function mergeBundle(bundleA: MatryBundle, bundleB: MatryBundle): MatryBundle {
  for (const key in bundleB.token_declarations) {
    if (bundleA.token_declarations.hasOwnProperty(key)) {
      throw new Error(`Error: found duplicate token entry: ${key}`)
    }

    bundleA.token_declarations[key] = bundleB.token_declarations[key]!
  }

  for (const key in bundleB.token_assignments) {
    if (bundleA.token_assignments.hasOwnProperty(key)) {
      throw new Error(`Error: found duplicate token entry: ${key}`)
    }

    bundleA.token_assignments[key] = bundleB.token_assignments[key]!
  }

  return bundleA
}
