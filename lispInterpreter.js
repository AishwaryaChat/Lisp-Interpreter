const spaceParser = input => input.match(/^[\s\n]/) ? [null, input.slice(input.match(/\S/).index)] : null
const numParser = input => {
  let regexp = String(input).match(/^[-+]?(\d+(\.\d*)?|\.\d+)([e][+-]?\d+)?/)
  if (!String(input).match(/^[-+]?(\d+(\.\d*)?|\.\d+)([e][+-]?\d+)?/)) return null
  return [parseInt(regexp[0]), input.slice(regexp[0].length)]
}

const plusParser = input => input.startsWith('+') ? [plus, input.slice(1)] : null
const minusParser = input => input.startsWith('-') ? [minus, input.slice(1)] : null
const multiplyParser = input => input.startsWith('*') ? [multiply, input.slice(1)] : null
const divideParser = input => input.startsWith('/') ? [divide, input.slice(1)] : null
const gtParser = input => input.startsWith('>') ? [greaterThan, input.slice(1)] : null
const ltParser = input => input.startsWith('<') ? [lessThan, input.slice(1)] : null
let gteParser = input => input.startsWith('>=') ? [gtEqTo, input.slice(2)] : null
let lteParser = input => input.startsWith('<=') ? [ltEqTo, input.slice(2)] : null
let etParser = input => input.startsWith('==') ? [eqTo, input.slice(2)] : null

const expressionParser = (input) => {
  let result = []
  let output
  if (!input.startsWith('(')) return null
  input = input.slice(1)
  while (true) {
    output = lteParser(input)
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

let result = []
let input = '(<= 10 10)'
let output = expressionParser(input)
const fun = output.shift()
output = fun(...output)
console.log(output)
