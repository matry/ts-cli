import { SyntaxNode } from 'tree-sitter'

export class Transformer {
  root: SyntaxNode
  output: any

  constructor(root: SyntaxNode) {
    this.root = root
    this.output = {
      token_declarations: {},
      token_overrides: {},
    }
  }

  private parseNum(node: SyntaxNode) {
    return node.text
  }

  private parseOp(node: SyntaxNode) {
    let value = ''
    switch (node.text) {
      case '*':
        value = 'mult'
        break
      case '+':
        value = 'sum'
        break
      case '-':
        value = 'sub'
        break
      case '%':
        value = 'mod'
        break
      default:
        break
    }

    return {
      type: 'operator',
      value,
    }
  }

  private parseArithmetic(node: SyntaxNode) {
    const parameters = []

    for (const childNode of node.namedChildren) {
      switch (childNode.type) {
        case 'ref':
          parameters.push(this.parseRef(childNode))
          break
        case 'func':
          parameters.push(this.parseFunc(childNode))
          break
        case 'hex':
          parameters.push(this.parseHex(childNode))
          break
        case 'num':
          parameters.push(this.parseNum(childNode))
          break
        case 'dimension':
          parameters.push(this.parseDimension(childNode))
          break
        case 'ref':
          parameters.push(this.parseRef(childNode))
          break
        case 'op':
          parameters.push(this.parseOp(childNode))
          break
        default:
          break
      }
    }

    return {
      type: 'func',
      method: 'arithmetic',
      parameters,
    }
  }

  private parseHex(node: SyntaxNode) {
    return {
      type: 'hex',
      value: node.text,
    }
  }

  private parseRef(node: SyntaxNode) {
    return {
      type: 'ref',
      value: node.text,
    }
  }

  private parseDimension(node: SyntaxNode) {
    const numNode = this.findChild(node, 'num')!
    const unitNode = this.findChild(node, 'unit')!

    return {
      type: unitNode.text,
      value: numNode.text,
    }
  }

  private parseParams(node: SyntaxNode): any[] {
    const params: any[] = []

    for (const childNode of node.namedChildren) {
      switch (childNode.type) {
        case 'func':
          params.push(this.parseFunc(childNode))
          break
        case 'num':
          params.push(this.parseNum(childNode))
          break
        case 'dimension':
          params.push(this.parseDimension(childNode))
          break
        case 'ref':
          params.push(this.parseRef(childNode))
          break
        case 'hex':
          params.push(this.parseHex(childNode))
          break
        case 'arithmetic':
          params.push(this.parseArithmetic(childNode))
          break
        default:
          break
      }
    }

    return params
  }

  private parseFunc(node: SyntaxNode) {
    const funcIdNode = this.findChild(node, 'func_id')!
    const paramsNode = this.findChild(node, 'params')!

    const func = {
      type: 'func',
      method: funcIdNode.text,
      parameters: this.parseParams(paramsNode),
    }

    return func
  }

  private parseExpression(node: SyntaxNode) {
    const subExpressions = []

    for (const childNode of node.namedChildren) {
      switch (childNode.type) {
        case 'func':
          subExpressions.push(
            this.parseFunc(childNode)
          )
          break
        case 'ref':
          subExpressions.push(
            this.parseRef(childNode)
          )
          break
        case 'hex':
          subExpressions.push(
            this.parseHex(childNode)
          )
          break
        case 'arithmetic':
          subExpressions.push(
            this.parseArithmetic(childNode)
          )
          break
        default:
          break
      }
    }

    return subExpressions
  }

  private parseBool(node: SyntaxNode) {
    const condNode = node.closest('cond')!
    const refNode = this.findChild(condNode, 'ref')!

    const posNode = this.findChild(node, 'pos')
    const negNode = this.findChild(node, 'neg')

    const operator = {
      type: 'operator',
      value: true,
    }

    if (posNode && !negNode) {
      operator.value = true
    } else if (negNode && !posNode) {
      operator.value = false
    }

    const idNode = this.findChild(node, 'id')!

    return {
      type: 'func',
      method: 'bool',
      parameters: [
        this.parseRef(refNode),
        operator,
        idNode.text,
      ],
    }
  }

  private parseSet(node: SyntaxNode) {
    const path = this.getPath(node)
    const idNode = this.findChild(node, 'set_id')!
    const expNode = this.findChild(node, 'exp')!

    return {
      name: idNode.text,
      path: path,
      expression: this.parseExpression(expNode),
    }
  }

  private parseAssertion(node: SyntaxNode) {
    const boolNode = this.findChild(node, 'bool')!

    const sets = []
    for (const childNode of node.namedChildren) {
      if (childNode.type === 'set') {
        sets.push(this.parseSet(childNode))
      }
    }

    return {
      assertion: this.parseBool(boolNode),
      sets,
    }
  }

  private parseConditional(node: SyntaxNode) {
    const path = this.getPath(node)!
    const refNode = this.findChild(node, 'ref')!

    this.output.token_overrides[path] = this.output.token_overrides[path] || {}

    const assertions = []
    for (const childNode of node.namedChildren) {
      if (childNode.type === 'assertion') {
        assertions.push(
          this.parseAssertion(childNode)
        )
      }
    }

    this.output.token_overrides[path][refNode.text] = this.output.token_overrides[path][refNode.text] || assertions
  }

  private parseDefinition(node: SyntaxNode) {
    const path = this.getPath(node)
    const typeNode = this.findChild(node, 'type')!
    const idNode = this.findChild(node, 'def_id')!
    const expNode = this.findChild(node, 'exp')!

    if (this.output.token_declarations[path]) {
      console.error(`Token names must be unique. The token ${path} already exists.`)
    }

    this.output.token_declarations[path] = {
      type: typeNode.text,
      name: idNode.text,
      path: path,
      expression: this.parseExpression(expNode),
    }
  }

  private getPath(node: SyntaxNode, accumulator: string[] = []): string {
    let idNode = null
    switch (node.type) {
      case 'tokens':
        idNode = this.findChild(node, 'block_id')
        break
      case 'block':
        idNode = this.findChild(node, 'block_id')
        break
      case 'def':
        idNode = this.findChild(node, 'def_id')
        break
      case 'set':
        idNode = this.findChild(node, 'set_id')
        break
    }

    if (idNode) {
      accumulator.push(idNode.text)
    }

    if (node.parent) {
      return this.getPath(node.parent, accumulator)
    }

    return accumulator.reverse().join('.')
  }

  private findChild(node: SyntaxNode, type: string) {
    return node.namedChildren.find((childNode) => {
      return childNode.type === type
    })
  }

  private processNode(node: SyntaxNode) {
    switch (node.type) {
      case 'def':
        this.parseDefinition(node)
        break
      case 'cond':
        this.parseConditional(node)
        break
      default:
        break
    }

    for (const childNode of node.namedChildren) {
      this.processNode(childNode)
    }
  }

  public transform() {
    this.processNode(this.root)
    return this.output
  }
}
