
export class Renderer {
  private resolve_count: number = 0
  private data: any = null
  public output: {[key: string]: any} = {}

  constructor(data: any) {
    this.data = data
  }

  render() {
    for (const k in this.data) {
      switch (k) {
        case 'token_declarations':
          this.resolve_token_declarations(this.data[k])
          break
        default:
          break
      }
    }

    if (this.resolve_count > 0) {
      this.resolve_count = 0
      this.render()
    }
  }

  resolve_token_declarations(declarations: any) {
    for (const k in declarations) {
      this.resolve_token_declaration(declarations[k])
    }
  }

  resolve_token_declaration(declaration: any) {
    const expression = this.output[declaration.path] || declaration.expression

    if (this.is_resolved(expression)) {
      return
    }

    this.output[declaration.path] = this.resolve_expression(expression)
  }

  resolve_expression(expression: any) {
    const result = []

    for (const operation of expression) {
      result.push(this.resolve_operation(operation))
    }

    if (result.length === 1) {
      return result[0]
    }

    return result
  }

  resolve_operation(operation: any) {
    let result = null

    switch (operation.type) {
      case 'hex':
        result = this.resolve_hex(operation)
        break
      case 'func':
        result = this.resolve_func(operation)
        break
      default:
        console.warn(`No resolver yet for type ${operation.type}`)
        break
    }

    return result
  }

  resolve_func(operation: any) {
    let result = null

    switch (operation.method) {
      case 'rgb':
        result = this.resolve_rgb(operation.parameters)
        break
      default:
        console.warn(`No func resolver yet for method ${operation.method}`)
        break
    }

    return result
  }

  resolve_rgb(params: string[]) {
    return `rgba(${params[0]}, ${params[1]}, ${params[2]}, ${params[3] || '1.0'})`
  }

  resolve_hex(expression: any) {
    this.resolve_count++
    return expression.value
  }

  is_resolved(expression: any) {
    let resolved = false

    switch (typeof expression) {
      case 'string':
        resolved = true
        break
      case 'number':
        resolved = true
        break
      default:
        break
    }

    return resolved
  }
}
