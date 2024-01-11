import { SyntaxNode } from 'tree-sitter'

export function getChildOfType(node: SyntaxNode, type: string) {
  return node.namedChildren.find((child) => {
    return child.type === type
  })
}
