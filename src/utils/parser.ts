import Parser, { Tree } from 'tree-sitter'
import Matry from 'tree-sitter-matry'
import { Transformer } from '../parser/transformer.js'

const parser = new Parser()
parser.setLanguage(Matry)

export function parseMatryFile(source: string) {
  const tree: Tree = parser.parse(source)
  const transformer = new Transformer(tree.rootNode)

  return transformer.transform()
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
