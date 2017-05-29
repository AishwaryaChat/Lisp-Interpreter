const spaceParser = input => input.match(/^[\s\n]/) ? [null, input.slice(input.match(/\S/).index)] : null
const numParser = input => {
  let regexp = String(input).match(/^[-+]?(\d+(\.\d*)?|\.\d+)([e][+-]?\d+)?/)
  if (!String(input).match(/^[-+]?(\d+(\.\d*)?|\.\d+)([e][+-]?\d+)?/)) return null
  return [parseInt(regexp[0]), input.slice(regexp[0].length)]
}
const boolParser = input => input.startsWith('true') ? [true, input.slice(4)] : (input.startsWith('false') ? [false, input.slice(5)] : null)
const identifierParser = input => input.match(/\w+/) ? [input.match(/\w+/)[0], input.slice(input.match(/\s+/).index)] : null

const plusParser = input => input.startsWith('+') ? [plus, input.slice(1)] : null
const minusParser = input => input.startsWith('-') ? [minus, input.slice(1)] : null
const multiplyParser = input => input.startsWith('*') ? [multiply, input.slice(1)] : null
const divideParser = input => input.startsWith('/') ? [divide, input.slice(1)] : null
const gtParser = input => input.startsWith('>') ? [greaterThan, input.slice(1)] : null
const ltParser = input => input.startsWith('<') ? [lessThan, input.slice(1)] : null
const gteParser = input => input.startsWith('>=') ? [gtEqTo, input.slice(2)] : null
const lteParser = input => input.startsWith('<=') ? [ltEqTo, input.slice(2)] : null
const etParser = input => input.startsWith('==') ? [eqTo, input.slice(2)] : null
const defParser = input => input.startsWith('define') ? [def, input.slice(6)] : null
const ifParser = input => input.startsWith('if') ? [ifFun, input.slice(2)] : null

const expressionParser = (input) => {
  let result = []
  let output
  if (!input.startsWith('(')) return null
  input = input.slice(1)
  while (true) {
    output = operatorParser(input)
    if (output === null) return null
    result.push(output[0])
    output = spaceParser(output[1])
    output = boolParser(output[1])
    result.push(output[0])
    output = spaceParser(output[1])
    output = numParser(output[1])
    result.push(output[0])
    output = spaceParser(output[1])
    output = numParser(output[1])
    result.push(output[0])
    if (output[1] === ')') return result
  }
}

const operatorParser = (input) => {
  let result
  result = plusParser(input) || minusParser(input) || multiplyParser(input) || divideParser(input) || gteParser(input) || lteParser(input) ||
  etParser(input) || gtParser(input) || ltParser(input) || defParser(input) || ifParser(input) || identifierParser(input)
  return result
}

const plus = (a, b) => {
  return a + b
}

const minus = (a, b) => {
  return a - b
}

const multiply = (a, b) => {
  return a * b
}

const divide = (a, b) => {
  if (b === 0) {
    return 'Can not divide by zero'
  } else {
    return a / b
  }
}

const greaterThan = (a, b) => {
  return a > b
}

const lessThan = (a, b) => {
  return a < b
}

const gtEqTo = (a, b) => {
  return a >= b
}

const ltEqTo = (a, b) => {
  return a <= b
}

const eqTo = (a, b) => {
  return a === b
}

const def = (a, b) => {
  return a = b
}

const ifFun = (a, b, c) => {
  if (a) {
    return b
  } else {
    return c
  }
}

let result = []
let input = '(if false 10 30)'
let output = expressionParser(input)
if (output === null) {
  output = 'error'
} else {
  const fun = output.shift()
  output = fun(...output)
}
console.log(output)
