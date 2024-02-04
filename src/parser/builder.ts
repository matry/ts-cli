import Parser, { SyntaxNode, Tree } from 'tree-sitter'
import Matry from 'tree-sitter-matry'

export class Builder {
  ast: Tree
  output: any

  constructor(source: string) {
    const parser = new Parser()
    parser.setLanguage(Matry)

    this.ast = parser.parse(source)
    this.output = {
      token_variants: {},
      token_declarations: {},
      token_overrides: {},
    }
  }

  public build() {
    this.processNode(this.ast.rootNode)
  }

  private parseNum(node: SyntaxNode): FunctionExpression {
    return {
      method: Method.Identity,
      return_type: ValueType.Number,
      parameters: [node.text],
    }
  }

  private parseStr(node: SyntaxNode): FunctionExpression {
    return {
      method: Method.Identity,
      return_type: ValueType.Text,
      parameters: [node.text],
    }
  }

  private parseAsset(node: SyntaxNode): FunctionExpression {
    return {
      method: Method.Identity,
      return_type: ValueType.Asset,
      parameters: [node.text],
    }
  }

  private parseOp(node: SyntaxNode): ArithmeticOperator {
    switch (node.text) {
      case '*':
        return ArithmeticOperator.Mult
      case '+':
        return ArithmeticOperator.Sum
      case '-':
        return ArithmeticOperator.Sub
      case '%':
        return ArithmeticOperator.Mod
      default:
        return ArithmeticOperator.Sum
    }
  }

  private parseArithmetic(node: SyntaxNode): FunctionExpression {
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
      method: Method.Arithmetic,
      return_type: ValueType.Number,
      parameters,
    }
  }

  private parseHex(node: SyntaxNode): FunctionExpression {
    return {
      method: Method.Identity,
      return_type: ValueType.Color,
      parameters: [node.text],
    }
  }

  private parseRef(node: SyntaxNode): FunctionExpression {
    return {
      method: Method.Ref,
      return_type: ValueType.Text,
      parameters: [node.text],
    }
  }

  private parseDimension(node: SyntaxNode): FunctionExpression {
    const numNode = this.findChild(node, 'num')!
    const unitNode = this.findChild(node, 'unit')!

    return {
      method: Method.Dimension,
      return_type: ValueType.Number,
      parameters: [numNode.text, unitNode.text],
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

  private parseFunc(node: SyntaxNode): FunctionExpression {
    const funcIdNode = this.findChild(node, 'func_id')!
    const paramsNode = this.findChild(node, 'params')!

    let method = null

    switch (funcIdNode.text) {
      case 'rgb':
        method = Method.Rgb
        break
      case 'hex':
        method = Method.Identity
        break
      case 'darken':
        method = Method.Darken
        break
      case 'lighten':
        method = Method.Lighten
        break
      default:
        method = Method.Identity
        break
    }

    return {
      method,
      return_type: ValueType.Color, // currently this is the only func type supported
      parameters: this.parseParams(paramsNode),
    }
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
        case 'dimension':
          subExpressions.push(
            this.parseDimension(childNode)
          )
          break
        case 'str':
          subExpressions.push(
            this.parseStr(childNode)
          )
          break
        case 'asset':
          subExpressions.push(
            this.parseAsset(childNode)
          )
          break
        default:
          console.warn(`found uncaptured expression type: ${childNode.type}`)
          break
      }
    }

    return subExpressions
  }

  private parseBool(node: SyntaxNode): FunctionExpression {
    const condNode = node.closest('cond')!
    const refNode = this.findChild(condNode, 'ref')!

    const posNode = this.findChild(node, 'pos')
    const negNode = this.findChild(node, 'neg')

    let operatorMethod = Method.Eq
    if (negNode && !posNode) {
      operatorMethod = Method.Neq
    }

    const idNode = this.findChild(node, 'id')!

    return {
      method: operatorMethod,
      return_type: ValueType.Bool,
      parameters: [
        this.parseRef(refNode),
        idNode.text,
      ],
    }
  }

  private parseOverride(node: SyntaxNode) {
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

    const overrides = []
    for (const childNode of node.namedChildren) {
      if (childNode.type === 'set') {
        overrides.push(this.parseOverride(childNode))
      }
    }

    return {
      assertion: this.parseBool(boolNode),
      overrides,
    }
  }

  private parseConditional(node: SyntaxNode) {
    // const path = this.getPath(node)!
    const refNode = this.findChild(node, 'ref')!

    this.output.token_overrides[refNode.text] = this.output.token_overrides[refNode.text] || []

    for (const childNode of node.namedChildren) {
      if (childNode.type === 'assertion') {
        this.output.token_overrides[refNode.text].push(
          this.parseAssertion(childNode)
        )
      }
    }
  }

  private parseDefinition(node: SyntaxNode): void {
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

  private parseVariantValues(node: SyntaxNode) {
    const switchNode = this.findChild(node, 'switch')!

    const values: any = []

    for (const childNode of switchNode.namedChildren) {
      if (childNode.type === 'id') {
        const value = {
          value: childNode.text,
          is_default: childNode.nextNamedSibling?.type === 'asterisk',
        }
        values.push(value)
      }
    }

    return values
  }

  private parseVariant(node: SyntaxNode) {
    const typeNode = this.findChild(node, 'type')!
    const idNode = this.findChild(node, 'id')!
    const initialNode = this.findChild(node, 'initial')!

    this.output.token_variants[idNode.text] = {
      type: typeNode.text,
      name: idNode.text,
      values: this.parseVariantValues(initialNode),
    }
  }

  private parseVariants(node: SyntaxNode) {
    for (const childNode of node.namedChildren) {
      if (childNode.type === 'var') {
        this.parseVariant(childNode)
      }
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
      case 'variants':
        this.parseVariants(node)
        break
      default:
        break
    }

    for (const childNode of node.namedChildren) {
      this.processNode(childNode)
    }
  }
}
