
const sample_data = {
  declarations: {
    'brand.primary-color': {
      type: 'color',
      value: '#BADA55',
    },
  },
  assignments: {
    'theme': {
      'crimson': {
        'brand.primary-color': '#FF0000',
      },
      'lavender': {
        'brand.primary-color': '#4477FF',
      },
    },
  },
}

function producePropertiesString(lines = [], initial = '') {
  let firstLine = initial || ':root {'

  return [
    firstLine,
    ...lines,
    '}'
  ].join('\n')
}

function produceDeclarations(data) {
  return Object.entries(data.declarations).map(([tokenKey, tokenObject]) => {
    return `--${tokenKey.replaceAll('.', '-')}: ${tokenObject.value};`
  })
}

function produceLines(obj) {
  return Object.entries(obj).map(([k, v]) => `--${k.replaceAll('.', '-')}: ${v};`)
}

function produceAssignments(data) {
  const ruleSets = []

  Object.entries(data.assignments).forEach(([variantKey, variantAssignments]) => {
    console.log(`k: ${variantKey}`)
    Object.entries(variantAssignments).forEach(([variantValue, assignments]) => {
      console.log(`v: ${variantValue}`)
      console.log(assignments)
      const lines = produceLines(assignments)
      console.log(lines)
      ruleSets.push(
        producePropertiesString(
          lines,
          `[data-${variantKey.replaceAll('.', '-')}="${variantValue}"] {`,
        )
      )
    })
  })

  return ruleSets
}

export function produceCustomProperties(data) {
  const declarations = produceDeclarations(data)
  const assignments = produceAssignments(data)

  console.log('ass')
  console.log(assignments)

  return [
    producePropertiesString(declarations),
    ...assignments,
  ].join('\n')
}

const cssString = produceCustomProperties(sample_data)

console.log(cssString)

const styleSheet = document.createElement('style')
styleSheet.textContent = cssString
document.head.appendChild(styleSheet)
