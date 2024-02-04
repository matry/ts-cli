
class RenderItem {
  type: string
  value: string

  constructor(type: string, value: string) {
    this.type = type
    this.value = value
  }
}

export class Renderer {
  private resolve_count: number = 0
  private data: any = null
  public output: {[key: string]: any} = {}

  constructor(data: any) {
    this.data = data
  }

  render(parameters: {[key:string]:any}) {
    this.resolve_token_variants(parameters)
    this.resolve_token_declarations(this.data.token_declarations)
    this.resolve_token_overrides()

    // TODO: remove once infinite loop is fixed
    // if (this.resolve_count > 0) {
    //   this.resolve_count = 0
    //   this.render(parameters)
    // }
  }

  resolve_token_variants(parameters: {[key:string]:any}) {
    for (const k in this.data.token_variants) {
      if (parameters.hasOwnProperty(k)) {
        this.output[k] = {
          type: ValueType.Text,
          value: parameters[k],
        }
        continue
      }

      const variant = this.data.token_variants[k]!

      if (variant.values.length > 1) {
        const defaultValue = variant.values.find((v: any) => v.is_default)
        if (defaultValue) {
          this.output[k] = {
            type: ValueType.Text,
            value: defaultValue.value,
          }
        }
      } else if (variant.values.length === 1) {
        this.output[k] = {
          type: ValueType.Text,
          value: variant.values[0].value
        }
      }
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

  resolve_token_overrides() {
    for (const key in this.data.token_overrides) {
      for (const definition of this.data.token_overrides[key]) {
        const variantKey = definition.assertion.parameters[0].parameters[0]
        const value = definition.assertion.parameters[1]
        const method = definition.assertion.method

        let shouldApply = false

        if (method === Method.Eq) {
          shouldApply = this.output[variantKey]?.value === value
        } else if (method === Method.Neq) {
          shouldApply = this.output[variantKey]?.value !== value
        }

        if (shouldApply) {
          for (const override of definition.overrides) {
            this.output[override.path] = this.resolve_expression(override.expression)
          }
        }
      }
    }
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

    if (['string', 'number'].includes(typeof operation)) {
      return operation
    }

    switch (operation.method) {
      case Method.Rgb:
        result = this.resolve_rgb(operation)
        break
      case Method.Identity:
        result = this.resolve_identity(operation)
        break
      case Method.Dimension:
        result = this.resolve_dimension(operation)
        break
      case Method.Arithmetic:
        break
      case 'hex':
        result = this.resolve_hex(operation)
        break
      case 'func':
        result = this.resolve_func(operation)
        break
      default:
        console.warn(`No resolver yet for type ${operation.method}`)
        break
    }

    return result
  }

  resolve_dimension(operation: any): RenderItem {
    this.resolve_count++
    return new RenderItem(ValueType.Number, `${operation.parameters[0]}${operation.parameters[1]}`)
  }

  resolve_identity(operation: any): RenderItem {
    this.resolve_count++
    return new RenderItem(operation.return_type, operation.parameters[0])
  }

  resolve_func(operation: any) {
    let result = null

    const parameters = []
    for (const param of operation.parameters) {
      parameters.push(this.resolve_operation(param))
    }

    switch (operation.method) {
      case 'rgb':
        result = this.resolve_rgb(parameters)
        break
      default:
        console.warn(`No func resolver yet for method ${operation.method}`)
        break
    }

    return result
  }

  resolve_rgb(operation: any): RenderItem {
    const parameters = operation.parameters.map((parameter_expression: any) => {
      return this.resolve_identity(parameter_expression).value
    })

    let value = ''

    if (parameters.length === 4) {
      value = `rgba(${parameters.join(',')})`
    } else {
      value = `rgba(${parameters.join(',')},1.0)`
    }

    return new RenderItem(ValueType.Color, value)
  }

  resolve_hex(expression: any): RenderItem {
    this.resolve_count++
    return new RenderItem(
      ValueType.Color,
      expression.value,
    )
  }

  is_resolved(expression: any) {
    if (expression instanceof RenderItem) {
      return true
    }

    return ['string', 'number'].includes(typeof expression)
  }
}
