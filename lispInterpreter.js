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
const maxParser = input => input.startsWith('max') ? [maxFun, input.slice(3)] : null
const minParser = input => input.startsWith('min') ? [minFun, input.slice(3)] : null
const notParser = input => input.startsWith('not') ? [notFun, input.slice(3)] : null
const beginParser = input => input.startsWith('begin') ? [begFun, input.slice(5)] : null

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

const plus = (a, b) => a + b
const minus = (a, b) => a - b
const multiply = (a, b) => a * b
const divide = (a, b) => (b === 0) ? 'Can not divide by zero' : a / b
const greaterThan = (a, b) => a > b
const lessThan = (a, b) => a < b
const gtEqTo = (a, b) => a >= b
const ltEqTo = (a, b) => a <= b
const eqTo = (a, b) => a === b
const def = (a, b) => a = b
const ifFun = (a, b, c) => a ? b : c
const maxFun = (a, b) => a > b ? a : b
const minFun = (a, b) => a < b ? a : b
const notFun = a => !a
const begFun = (a) => {

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
