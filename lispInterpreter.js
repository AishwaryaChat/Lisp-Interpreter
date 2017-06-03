const fs = require('fs')
const ENV = {
  // a: 10
}

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
// const defFun = (a, b) => { ENV[a] = b }
const ifFun = (a, b, c) => a ? b : c
const maxFun = (a, b) => a > b ? a : b
const minFun = (a, b) => a < b ? a : b
const notFun = a => !a
const lambdaFun = (a, b) => {
  return {
    type: 'lambda',
    args: [a],
    body: b,
    env: {}
  }
}

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
const ifParser = input => input.startsWith('if') ? [ifFun, input.slice(2)] : null
const maxParser = input => input.startsWith('max') ? [maxFun, input.slice(3)] : null
const minParser = input => input.startsWith('min') ? [minFun, input.slice(3)] : null
const notParser = input => input.startsWith('not') ? [notFun, input.slice(3)] : null
const functionParser = input => input.startsWith('lambda') ? [lambdaFun, input.slice(6)] : null

const parserFactory = (...parsers) => input => {
  for (let parser of parsers) {
    let output = parser(input)
    if (output !== null) return output
  }
  return null
}

const operatorParser = input => parserFactory(plusParser, minusParser, multiplyParser, divideParser, gteParser, lteParser, gtParser, ltParser, etParser, ifParser, maxParser, minParser, notParser, functionParser)(input)

const spaceParser = input => {
  let match = input.match(/^[\s\n]/)
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

const identifierParser = (input, flag) => {
  let match = input.match(/^[a-zA-Z]+/)
  if (match === null) return null
  let idStr = match[0]
  let num = ENV[idStr]
  if (flag === true) return [idStr, input.slice(idStr.length)]
  if (num !== undefined) {
    return [num, input.slice(idStr.length)]
  }
  throw new Error(`${idStr} is not defined`)
}

const expressionParser = (input) => {
  if (input.startsWith('(')) {
    input = input.slice(1)
    return parserFactory(numParser, operatorParser, identifierParser)(input)
  } else return parserFactory(numParser, identifierParser)(input)
}

const statementParser = (input) => {
  let output = ''
  let tempResult = []
  let result = []
  if (input.startsWith('print')) {
    input = input.slice(6)
    while (!input.startsWith(')')) {
      output = expressionParser(input)
      if (output !== null) {
        tempResult.push(output[0])
        input = output[1]
        output = spaceParser(input)
        if (output !== null) {
          input = output[1]
        }
      }
    }
    while (input.startsWith(')')) {
      input = input.slice(1)
    }
    if (input !== '') {
      output = spaceParser(input)
      if (output !== null) {
        input = output[1]
      }
    }
    if (tempResult.length === 1) {
      console.log(tempResult[0])
      if (input === '') {
        return 'completed'
      } else {
        return input
      }
    } else {
      while (true) {
        let val = tempResult.pop()
        if (typeof val === 'function') {
          let res = val(...result.reverse())
          result = []
          tempResult.push(res)
          if (tempResult.length === 1) break
        } else {
          result.push(val)
        }
      }
    }
    console.log(tempResult[0])
    if (input === '') {
      return 'completed'
    } else {
      return input
    }
  } else if (input.startsWith('define')) {
    let iden = ''
    input = input.slice(7)
    output = identifierParser(input, true)
    if (output !== null) {
      iden = output[0]
      input = output[1]
      output = spaceParser(input)
      input = output[1]
      while (!input.startsWith(')')) {
        output = expressionParser(input)
        if (output !== null) {
          tempResult.push(output[0])
          input = output[1]
          output = spaceParser(input)
          if (output !== null) {
            input = output[1]
          }
        }
      }
      while (input.startsWith(')')) {
        input = input.slice(1)
      }
      if (input !== '') {
        output = spaceParser(input)
        if (output !== null) {
          input = output[1]
        }
      }
      if (tempResult.length === 1) {
        ENV[iden] = tempResult[0]
        if (input === '') {
          return 'completed'
        } else {
          return input
        }
      } else {
        while (true) {
          let val = tempResult.pop()
          if (typeof val === 'function') {
            let res = val(...result.reverse())
            result = []
            tempResult.push(res)
            if (tempResult.length === 1) break
          } else {
            result.push(val)
          }
        }
      }
      ENV[iden] = tempResult[0]
      if (input === '') {
        return 'completed'
      } else {
        return input
      }
    }
  }
}

const programParser = (input) => {
  while (true) {
    if (input.startsWith('(')) {
      input = input.slice(1)
      let output = ''
      output = statementParser(input)
      if (output === 'completed') {
        return 'completed'
      }
      input = output
      if (input !== '') {
        output = spaceParser(input)
        if (output !== null) {
          input = output[1]
        }
      }
    } else return null
  }
}

let input = fs.readFileSync('test.txt').toString()
let output = programParser(input)
console.log(output)
console.log(ENV)
