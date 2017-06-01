const fs = require('fs')
const ENV = {}

// Lisp Functions
const plus = (a, b) => a + b
const minus = (a, b) => a - b
const multiply = (a, b) => a * b
const divide = (a, b) => (b === 0) ? 'Can not divide by zero' : a / b
const greaterThan = (a, b) => a > b
const lessThan = (a, b) => a < b
const gtEqTo = (a, b) => a >= b
const ltEqTo = (a, b) => a <= b
const eqTo = (a, b) => a === b
const def = (a, b) => { ENV.a = b }
const ifFun = (a, b, c) => a ? b : c
const maxFun = (a, b) => a > b ? a : b
const minFun = (a, b) => a < b ? a : b
const notFun = a => !a

// Tokenizers
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

const parserFactory = (...parsers) => input => {
  for (let parser of parsers) {
    let output = parser(input)
    if (output !== null) return output
  }
}

const operatorParser = parserFactory(plusParser, minusParser, multiplyParser, divideParser, gteParser, lteParser, gtParser, ltParser, etParser, defParser, ifParser, maxParser, minParser, notParser)

const spaceParser = input => {
  let match = input.match(/^[\s\n]+/)
  if (match === null) return null
  let spaceLt = match[0].length
  return [null, input.slice(spaceLt)]
}

const numParser = input => {
  let match = input.match(/^[-+]?(\d+(\.\d*)?|\.\d+)([e][+-]?\d+)?/)
  if (match === null) return null
  let numStr = match[0]
  return [parseInt(numStr), input.slice(numStr.length)]
}

const identifierParser = input => {
  let match = input.match(/^[a-zA-Z]+/)
  if (match === null) return null
  let idStr = match[0]
  return [idStr, input.slice(idStr.length)]
}

const expressionParser = parserFactory(numParser, operatorParser)

const statementParser = (input) => {
  let output = ''
  if (input.startsWith('print')) {
    input = input.slice(6)
    output = identifierParser(input)
    if (output !== null) {
      let val = ENV[output[0]]
      if (val === undefined) {
        console.log('Error ', output[0], ' is not defined')
        return null
      } else {
        console.log(val)
      }
    } else {
      output = numParser(input)
      console.log(output[0])
    }
    input = output[1]
    if (!input.startsWith(')')) return null
    return input.slice(1)
  } else if (input.startsWith('define')) {
    let result = []
    input = input.slice(7)
    output = identifierParser(input)
    result.push(output[0])
    input = output[1]
    output = spaceParser(input)
    output = numParser(output[1])
    result.push(output[0])
    defFun(...result)
    input = output[1]
    if (!input.startsWith(')')) return null
    return input.slice(1)
  }
  return null
}

const programParser = (input) => {
  while (true) {
    if (input.startsWith('(')) {
      input = input.slice(1)
      let output = ''
      output = statementParser(input)
      output = output(input)
      input = output
      if (output === null) return null
      if (output !== '') {
        output = spaceParser(input)
        if (output !== null) {
          input = output[1]
        }
      }
      if (input === '') return 'completed'
    } else return null
  }
}

const defFun = (a, b) => { ENV[a] = b }

let input = fs.readFileSync('test.txt').toString()
// let output = programParser(input)
// console.log(output)
