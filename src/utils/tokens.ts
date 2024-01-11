import { SyntaxNode } from 'tree-sitter'
import { getChildOfType } from './ast.js'

/*

"token_assignments": {
  "branding.primary-blue": [
    {
      "conditions": [
        {
          "identifier": "theme",
          "assertion": "positive",
          "value": "rosemary"
        }
      ],
      "declared_value": {
        "format": "hex",
        "raw": "#007BFF"
      }
    }
  ]

  theme: [
    {
      assertion_operator: positive,
      assertion_value: rosemary,
      id: branding.primary-color,
      declared_value: {
        format: hex,
        raw: #007BFF
      },
    }
  ]
},

*/

export function parseTokenAssignment(node: SyntaxNode) {
  const tokenContext = getTokenDeclarationContext(node)

  let id
  let declared_value

  for (const tokenNode of node.namedChildren) {
    switch (tokenNode.type) {
      case 'identifier':
        id = tokenNode.text
        break
      case 'token_value':
        const valueObject = parseTokenValue(tokenNode)
        declared_value = valueObject.declared_value
        break
    }
  }

  if (tokenContext) {
    id = `${tokenContext}.${id}`
  }

  return {
    id,
    declared_value,
  }
}

export function parseTokenConditionalBlock(node: SyntaxNode, bundle: MatryBundle) {
  const assignments: any = {}

  let reference = ''
  let assignment: any = {}

  let i = 0
  while (i < node.namedChildren.length) {
    const childNode = node.namedChildren[i]!
    switch (childNode.type) {
      case 'token_reference':
        reference = childNode.firstNamedChild!.text
        break
      case 'positive_assertion':
        assignment.assertion_operator = 'positive'
        break
      case 'negative_assertion':
        assignment.assertion_operator = 'negative'
        break
      case 'identifier':
        assignment.assertion_value = childNode.text
        break
      case 'token_assignment':
        const { id, declared_value } = parseTokenAssignment(childNode)
        assignment.id = id
        assignment.declared_value = declared_value
        assignments[reference] = assignments[reference] || []
        assignments[reference].push(assignment)
        assignment = {}
        break
      default:
        break
    }

    i++
  }

  bundle.token_assignments = {
    ...bundle.token_assignments,
    ...assignments,
  }
}

export function getTokenDeclarationContext(node: SyntaxNode, segments: string[] = []) {
  if (node.parent) {
    if (['child_token_block', 'tokens_block'].includes(node.parent.type)) {
      const identifierNode = getChildOfType(node.parent, 'identifier')
      if (identifierNode) {
        segments.unshift(identifierNode.text)
      }
    }

    return getTokenDeclarationContext(node.parent, segments)
  }

  return segments.join('.')
}

export function parseTokenDeclaration(node: SyntaxNode, bundle: MatryBundle) {
  const tokenContext = getTokenDeclarationContext(node)

  let type
  let name
  let id
  let declared_value

  for (const tokenNode of node.namedChildren) {
    switch (tokenNode.type) {
      case 'token_type':
        type = tokenNode.text
        break
      case 'identifier':
        name = tokenNode.text
        break
      case 'token_value':
        const valueObject = parseTokenValue(tokenNode)
        declared_value = valueObject.declared_value
        break
    }
  }

  if (tokenContext) {
    id = `${tokenContext}.${name}`
  } else {
    id = name
  }

  bundle.token_declarations[id!] = {
    id: id!,
    name: name!,
    type: type!,
    declared_value: declared_value!,
  }
}

export function parseTokenValue(tokenNode: SyntaxNode) {
  const valueObject: any = {
    declared_value: null,
  }

  const valueNode = tokenNode.namedChildren[0]

  if (!valueNode) {
    return
  }

  switch (valueNode.type) {
    case 'hex':
      valueObject.declared_value = {
        format: 'hex',
        raw: valueNode.text,
      }
      break
    case 'string':
      valueObject.declared_value = valueNode.text
      break
    case 'asset_path':
      valueObject.declared_value = {
        format: valueNode.text.split('.')[1] || '',
        raw: valueNode.text,
      }
      break
    case 'dimension':
      const numberNode = getChildOfType(valueNode, 'number')
      const unitNode = getChildOfType(valueNode, 'dimensional_unit')

      valueObject.declared_value = {
        format: unitNode ? unitNode.text : '',
        raw: numberNode!.text,
      }
      break
    case 'switch':
      const switchOptions = parseSwitch(valueNode)
      valueObject.declared_value = switchOptions
      break
    case 'token_reference':
      valueObject.declared_value = {
        ref: valueNode.firstNamedChild!.text,
      }
      break
    default:
      break
  }

  return valueObject
}

export function parseSwitch(node: SyntaxNode) {
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

  return values
}
