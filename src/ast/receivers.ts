import { SyntaxNode } from 'tree-sitter'
import { getChildOfType } from '../utils/ast.js'

function source_file_node(node: SyntaxNode, processor: (input: SyntaxNode) => any) {
  return node.namedChildren.map(processor).filter(item => item !== null)
}

function a98rgb_node(node: SyntaxNode, processor: any) {
  return rgb_node(node, processor)
}

function alpha_channel_node(node: SyntaxNode) {
  return node.text
}

function asset_path_node(node: SyntaxNode) {
  return {
    format: node.text.split('.')[1] || '',
    raw: node.text,
  }
}

function blue_channel_node(node: SyntaxNode) {
  return node.text
}

function child_token_block_node(node: SyntaxNode, processor: any) {
  return tokens_block_node(node, processor)
}

function color_expression_node(node: SyntaxNode, processor: any) {
  return {
    expression: node.namedChildren.map((childNode) => {
      return processor(childNode, processor)
    })
  }
}

function color_function_name_node(node: SyntaxNode) {
  return node.text
}

interface ColorFunction {
  function_name: string
  parameters: any[]
}

function color_function_call_node(node: SyntaxNode, processor: any) {
  const result: ColorFunction = {
    function_name: processor(node.firstNamedChild),
    parameters: [],
  }

  for (let i = 1, l = node.namedChildren.length; i < l; i++) {
    const childNode = node.namedChildren[i]
    result.parameters.push(processor(childNode, processor))
  }

  return result
}

function conditional_token_block_node(node: SyntaxNode, processor: any) {
  const assignments: any = {}

  let reference = ''
  let assertion_operator: boolean = true
  let assertion_value = null

  for (const childNode of node.namedChildren) {
    switch (childNode.type) {
      case 'token_reference':
        reference = processor(childNode, processor)
        break
      case 'positive_assertion':
        assertion_operator = true
        break
      case 'negative_assertion':
        assertion_operator = false
        break
      case 'identifier':
        assertion_value = processor(childNode, processor)
        break
      case 'token_assignment':
        const assignment = processor(childNode, processor)
        assignments[reference] = assignments[reference] || []
        assignments[reference].push({
          assignment,
          assertion_operator,
          assertion_value,
        })
        break
      default:
        break
    }
  }

  return assignments
}

function dimension_node(node: SyntaxNode) {
  const numberNode = getChildOfType(node, 'number')
  const unitNode = getChildOfType(node, 'dimensional_unit')

  return {
    format: unitNode ? unitNode.text : '',
    raw: numberNode!.text,
  }
}

function expression_node(node: SyntaxNode, processor: any) {
  return node.namedChildren.map((childNode) => {
    return processor(childNode, processor)
  })
}

function green_channel_node(node: SyntaxNode) {
  return node.text
}

function hex_node(node: SyntaxNode) {
  return {
    format: 'hex',
    raw: node.text,
  }
}

function hsl_node(node: SyntaxNode, processor: any) {
  const result = {
    h: '',
    s: '',
    l: '',
    a: '',
  }

  for (const childNode of node.namedChildren) {
    switch (childNode.type) {
      case 'hue_channel':
        result.h = processor(childNode, processor)
        break
      case 'saturation_channel':
        result.s = processor(childNode, processor)
        break
      case 'lightness_channel':
        result.l = processor(childNode, processor)
        break
      case 'alpha_channel':
        result.a = processor(childNode, processor)
        break
      default:
        break
    }
  }

  return result
}

function hsv_node(node: SyntaxNode, processor: any) {
  const result = {
    h: '',
    s: '',
    v: '',
    a: '',
  }

  for (const childNode of node.namedChildren) {
    switch (childNode.type) {
      case 'hue_channel':
        result.h = processor(childNode, processor)
        break
      case 'saturation_channel':
        result.s = processor(childNode, processor)
        break
      case 'value_channel':
        result.v = processor(childNode, processor)
        break
      case 'alpha_channel':
        result.a = processor(childNode, processor)
        break
      default:
        break
    }
  }

  return result
}

function identifier_node(node: SyntaxNode) {
  return node.text
}

function numeric_operator_node(node: SyntaxNode) {
  return node.text
}

function percent_number_node(node: SyntaxNode) {
  return `${node.firstNamedChild!.text}%`
}

function red_channel_node(node: SyntaxNode) {
  return node.text
}

function ref_identifier_node(node: SyntaxNode) {
  return identifier_node(node)
}

function rgb_node(node: SyntaxNode, processor: any) {
  const result = {
    r: '',
    g: '',
    b: '',
    a: '',
  }

  for (const childNode of node.namedChildren) {
    switch (childNode.type) {
      case 'red_channel':
        result.r = processor(childNode, processor)
        break
      case 'green_channel':
        result.g = processor(childNode, processor)
        break
      case 'blue_channel':
        result.b = processor(childNode, processor)
        break
      case 'alpha_channel':
        result.a = processor(childNode, processor)
        break
      default:
        break
    }
  }

  return result
}

function string_node(node: SyntaxNode) {
  return {
    format: 'plaintext',
    raw: node.text,
  }
}

function switch_node(node: SyntaxNode) {
  const values = []

  for (let i = 0, l = node.namedChildren.length; i < l; i++) {
    const child = node.namedChildren[i]!

    if (child.type === 'asterisk') {
      const lastValue = values[values.length - 1]
      if (lastValue) {
        lastValue.is_default = true
      }
    }
    if (child.type === 'identifier') {
      values.push({
        id: child.text,
        is_default: false,
      })
    }
  }

  return {
    format: 'enum', // may change to define typed switches later on (e.g. color switches, dimension switches, etc)
    raw: values,
  }
}

interface TokenDeclaration {
  id: string
  type: string
  declared_value: any
}

function token_declaration_node(node: SyntaxNode, processor: any) {
  const result: TokenDeclaration = {
    id: '',
    type: '',
    declared_value: null,
  }

  for (const childNode of node.namedChildren) {
    switch (childNode.type) {
      case 'token_type':
        result.type = processor(childNode, processor)
        break
      case 'identifier':
        result.id = processor(childNode, processor)
        break
      case 'token_value':
        result.declared_value = processor(childNode, processor)
        break
    }
  }

  return result
}

function token_assignment_node(node: SyntaxNode, processor: any) {
  return {
    id: processor(node.firstNamedChild, processor),
    declared_value: processor(node.lastNamedChild, processor),
  }
}

function token_reference_node(node: SyntaxNode) {
  return {
    ref: node.firstNamedChild!.text,
  }
}

function token_type_node(node: SyntaxNode) {
  return node.text
}

function token_value_node(node: SyntaxNode, processor: any) {
  return processor(node.firstNamedChild)
}

interface TokensBlock {
  id: string
  declarations: any[]
  groups: any[]
  conditionals: any[]
}

function tokens_block_node(node: SyntaxNode, processor: (input: SyntaxNode) => any) {
  const result: TokensBlock = {
    id: '',
    declarations: [],
    groups: [],
    conditionals: [],
  }

  for (const childNode of node.namedChildren) {
    switch (childNode.type) {
      case 'identifier':
        result.id = processor(childNode)
        break
      case 'token_declaration':
        result.declarations.push(processor(childNode))
        break
      case 'child_token_block':
        result.groups.push(processor(childNode))
        break
      case 'conditional_token_block':
        result.conditionals.push(processor(childNode))
        break
      default:
        break
    }
  }

  return result
}

const receivers: {[key: string]: any} = {
  source_file_node,
  a98rgb_node,
  asset_path_node,
  alpha_channel_node,
  blue_channel_node,
  child_token_block_node,
  color_expression_node,
  color_function_call_node,
  color_function_name_node,
  conditional_token_block_node,
  dimension_node,
  expression_node,
  green_channel_node,
  hex_node,
  hsl_node,
  hsv_node,
  identifier_node,
  numeric_operator_node,
  percent_number_node,
  red_channel_node,
  ref_identifier_node,
  rgb_node,
  string_node,
  switch_node,
  token_assignment_node,
  token_declaration_node,
  token_reference_node,
  token_type_node,
  token_value_node,
  tokens_block_node,
}

export default receivers
