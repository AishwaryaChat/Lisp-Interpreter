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
const ifParser = input => input.startsWith('if') ? [ifFun, input.slice(2)] : null
const maxParser = input => input.startsWith('max') ? [maxFun, input.slice(3)] : null
const minParser = input => input.startsWith('min') ? [minFun, input.slice(3)] : null
const notParser = input => input.startsWith('not') ? [notFun, input.slice(3)] : null

const expressionParser = (input) => parserFactory(numParser, identifierParser, operatorParser)(input)

const operatorParser = input => {
  if (input.startsWith('(')) {
    input = input.slice(1)
    return parserFactory(plusParser, minusParser, multiplyParser, divideParser, gteParser, lteParser, gtParser, ltParser, etParser, ifParser, maxParser, minParser, notParser, lambdaParser)(input)
  }
  return null
}

const argumentsParser = (input) => {
  let args = []
  let output = ''
  while (!input.startsWith(')')) {
    output = identifierParser(input, true)
    args.push(output[0])
    input = output[1]
    output = spaceParser(input)
    if (output !== null) {
      input = output[1]
    } else break
  }
  if (input.startsWith(')')) {
    input = input.slice(1)
  } else throw new Error('arguments must ends with )')
  return [input, args]
}

const bodyParser = (input) => {
  if (!input.startsWith('(')) throw new Error('body must be in side brackets ()')
  input = input.slice(1)
  let body = '(', i = 1, j = 0, k = 0
  while (i !== j) {
    if (input[k] === '(') i++
    if (input[k] === ')') j++
    body = body + input[k]
    k++
  }
  input = input.substring(k)
  return [input, body]
}

const lambdaParser = input => {
  let output = ''
  let args = []
  if (input.startsWith('lambda')) {
    input = input.slice(7)
    if (!input.startsWith('(')) throw new Error('arguments must be in side brackets ()')
    input = input.slice(1)
    output = argumentsParser(input)
    args = output[1]
    output = spaceParser(output[0])
    output = bodyParser(output[1])
    input = output[0]
    let obj = {
      type: 'lambda',
      args: args,
      body: output[1],
      env: {}
    }
    return [obj, input]
  }
}

const parserFactory = (...parsers) => input => {
  for (let parser of parsers) {
    let output = parser(input)
    if (output !== null) return output
  }
  return null
}

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

const identifierParser = (input) => {
  let match = input.match(/^[a-zA-Z]+[0-9]*[a-zA-Z]*/)
  if (match === null) return null
  let idStr = match[0]
  return [idStr, input.slice(idStr.length)]
}

const evalFunction = (tempResult, iden) => {
  let result = []
  if (tempResult.length === 1) {
    if (iden !== undefined) {
      ENV[iden] = tempResult[0]
    }
    return tempResult[0]
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
    if (iden !== undefined) {
      ENV[iden] = tempResult[0]
    }
    return tempResult[0]
  }
}

const functionParser = (input, val) => {
  let output = ''
  let tempResult = []
  let obj = ENV[val]
  let {args, body, env} = obj
  let lambdaInput = body
  let i = 0
  let param = 0
  while (!input.startsWith(')')) {
    output = spaceParser(input)
    if (output !== null) {
      input = output[1]
    } else throw new Error('space is required')
    output = identifierParser(input) || numParser(input)
    if (output !== null) {
      input = output[1]
      param = output[0]
      if (typeof param === 'number') {
        env[args[i]] = param
      } else if (typeof param === 'string') {
        if (ENV[param] !== undefined) {
          env[args[i]] = ENV[param]
        } else throw new Error(`${param} is undefined`)
      }
    } else return new Error('No arguments are passed')
    i++
  }
  let tempVal = ''
  while (!lambdaInput.startsWith(')')) {
    output = expressionParser(lambdaInput)
    if (output !== null) {
      lambdaInput = output[1]
      tempVal = output[0]
      if (typeof tempVal === 'number') tempResult.push(tempVal)
      else if (typeof tempVal === 'string') {
        if (env[tempVal] !== undefined) {
          tempVal = env[tempVal]
        } else if (ENV[tempVal] !== undefined) {
          tempVal = ENV[tempVal]
        } else throw new Error(`${tempVal} is undefined`)
        tempResult.push(tempVal)
      } else {
        tempResult.push(tempVal)
      }
    }
    lambdaInput = output[1]
    output = spaceParser(lambdaInput)
    if (output !== null) {
      lambdaInput = output[1]
    }
  }
  if (input !== '') {
    output = spaceParser(input)
    if (output !== null) {
      input = output[1]
    }
  }
  tempResult = evalFunction(tempResult)
  return [tempResult, input]
}

const printParser = (input) => {
  let output = ''
  let val = ''
  let tempResult = []
  if (input.startsWith('(print')) {
    input = input.slice(6)
  } else return null
  output = spaceParser(input)
  if (output !== null) {
    input = output[1]
  } else throw new Error(`Space is required after statement`)
  while (!input.startsWith(')')) {
    output = expressionParser(input)
    if (output !== null) {
      val = output[0]
      input = output[1]
      if (typeof val === 'number') {
        tempResult.push(val)
      } else if (typeof val === 'string') {
        let idVal = ENV[val]
        if (idVal !== undefined) {
          if (typeof idVal === 'object') {
            output = functionParser(input, val)
            val = output[0]
            input = output[1]
            tempResult.push(val)
          } else {
            tempResult.push(idVal)
          }
        } else {
          throw new Error(`${val} is not defined`)
        }
      } else {
        tempResult.push(val)
      }
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

  if (input !== '' && input !== undefined) {
    output = spaceParser(input)
    if (output !== null) {
      input = output[1]
    }
  }
  let value = evalFunction(tempResult)
  console.log(value)
  return input
}

const defineParser = (input) => {
  let output = ''
  let tempResult = []
  if (input.startsWith('(define')) {
    input = input.slice(7)
  } else return null
  output = spaceParser(input)
  if (output !== null) {
    input = output[1]
  } else throw new Error(`Space is required after statement`)
  output = identifierParser(input)
  if (output !== null) {
    let iden = output[0]
    input = output[1]
    output = spaceParser(input)
    // console.log('output', output)
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
    evalFunction(tempResult, iden)
    return input
  }
}

const statementParser = (input) => {
  if (defineParser(input) !== null) {
    return defineParser(input)
  } else {
    return printParser(input)
  }
}

const programParser = (code) => {
  while (code !== '') {
    let output = ''
    output = spaceParser(code)
    if (output !== null) {
      code = output[1]
    }
    output = statementParser(code)
    code = output
  }
}

let code = fs.readFileSync('test.txt').toString()
programParser(code)
console.log(ENV)
