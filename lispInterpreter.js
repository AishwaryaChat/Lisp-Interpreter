const fs = require('fs')
const ENV = {}

// Lisp Functions
const plus = list => list.reduce((acc, item) => acc + item, 0)
const minus = list => list.reduce((acc, item) => acc - item)
const multiply = list => list.reduce((acc, item) => acc * item, 1)
const divide = list => (list[1] === 0) ? new Error(`Cannot divide by zero`) : list[0] / list[1]
const greaterThan = list => list[0] > list[1]
const lessThan = list => list[0] < list[1]
const gtEqTo = list => list[0] >= list[1]
const ltEqTo = list => list[0] <= list[1]
const eqTo = list => list[0] === list[1]
const ifFun = (a, b, c) => a ? b : c
const maxFun = list => Math.max(...list)
const minFun = list => Math.min(...list)
const notFun = list => !list[0]
const listFun = list => list
const carFun = list => list[list.length - 1]
const cdrFun = list => list[0]

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
const trueParser = input => input.startsWith('true') ? [true, input.slice(4)] : null
const falseParser = input => input.startsWith('false') ? [false, input.slice(5)] : null
const maxParser = input => input.startsWith('max') ? [maxFun, input.slice(3)] : null
const minParser = input => input.startsWith('min') ? [minFun, input.slice(3)] : null
const notParser = input => input.startsWith('not') ? [notFun, input.slice(3)] : null
const listParser = input => input.startsWith('list') ? [listFun, input.slice(4)] : null
const carParser = input => input.startsWith('car') ? [carFun, input.slice(3)] : null
const cdrParser = input => input.startsWith('cdr') ? [cdrFun, input.slice(3)] : null
const parseDefine = input => input.startsWith('define') ? ['define', input.slice(6)] : null

const expressionParser = (input) => parserFactory(lambdaParser, operatorParser, numParser,
                                                  identifierParser)(input)

const operatorParser = input => {
  if (input.startsWith('(')) {
    input = input.slice(1)
    return parserFactory(plusParser, minusParser, multiplyParser, divideParser,
                         gteParser, lteParser, gtParser, ltParser, etParser,
                         ifParser, maxParser, minParser, notParser, trueParser,
                         falseParser, listParser, carParser, cdrParser, lambdaParser)(input)
  } else return parserFactory(plusParser, minusParser, multiplyParser, divideParser,
                              gteParser, lteParser, gtParser, ltParser, etParser,
                              ifParser, maxParser, minParser, notParser, trueParser,
                              falseParser, listParser, carParser, cdrParser, lambdaParser)(input)
  return null
}

const spaceRequired = (input) => spaceParser(input) ? spaceParser(input)[1]
                                 : new Error(`Space is required`)

const argumentsParser = (input) => {
  let args = []
  let output = ''
  while (!input.startsWith(')')) {
    output = identifierParser(input, true)
    args.push(output[0])
    input = output[1]
    output = spaceParser(output[1])
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
    input = input.slice(6)
    input = spaceRequired(input)
    if (!input.startsWith('(')) throw new Error('arguments must be in side brackets ()')
    output = argumentsParser(input.slice(1))
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
  } else return null
}

const parserFactory = (...parsers) => input => {
  for (let parser of parsers) {
    let output = parser(input)
    if (output !== null) return output
  }
  return null
}

const allParsers = (...parsers) => input => {
  let result = []
  for (let parser of parsers) {
    let output = parser(input)
    if (output === null) return null
    result.push(output)
  }
  return result
}

const openBracket = input => input.startsWith('(') ? ['(', input.slice(1)] : null

const closeBracket = input => input.startsWith(')') ? [')', input.slice(1)] : null

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

const extractIdVal = (env, val) => env !== undefined ? env[val] : ENV[val]

const valCheck = (val, env, input, tempResult) => {
  let output = ''
  if (typeof val === 'number') {
    tempResult.push(val)
  } else if (typeof val === 'string') {
    let idVal = extractIdVal(env, val)
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
  return [tempResult, input]
}

const evaluation = (tempResult) => {
  let result = []
  while (true) {
    let val = tempResult.pop()
    if (typeof val === 'function') {
      let res = val(result.reverse())
      result = []
      tempResult.push(res)
      if (tempResult.length === 1) break
    } else {
      result.push(val)
    }
  }
  return tempResult
}

const idenCheck = (tempResult, iden) => {
  if (iden !== undefined) {
    ENV[iden] = tempResult[0]
  }
}

const evalFunction = (tempResult, iden) => {
  if (tempResult.length !== 1) {
    tempResult = evaluation(tempResult)
  }
  idenCheck(tempResult, iden)
  return tempResult[0]
}

const argsCheck = (output, i, env, args) => {
  let input = ''
  if (output !== null) {
    input = output[1]
    let param = output[0]
    if (typeof param === 'number') env[args[i]] = param
    else if (typeof param === 'string') {
      if (ENV[param] !== undefined) {
        env[args[i]] = ENV[param]
      } else throw new Error(`${param} is undefined`)
    }
  } else return new Error('No arguments are passed')
  return input
}

const storeArgs = (input, args, env) => {
  let output = ''
  let i = 0
  while (!input.startsWith(')')) {
    output = spaceParser(input)
    if (output !== null) {
      input = output[1]
    } else throw new Error('space is required')
    output = identifierParser(input) || numParser(input)
    input = argsCheck(output, i, env, args)
    i++
  }
  return input
}

const parseFunction = (input, env) => {
  let output = ''
  let tempResult = []
  let val = ''
  while (!input.startsWith(')')) {
    output = expressionParser(input)
    if (output !== null) {
      val = output[0]
      input = output[1]
      output = valCheck(val, env, input, tempResult)
      tempResult = output[0]
      input = output[1]
      output = spaceParser(input)
      if (output !== null) input = output[1]
    }
  }
  return [tempResult, input]
}

const functionParser = (input, val) => {
  let obj = ENV[val]
  let {args, body, env} = obj
  input = storeArgs(input, args, env)
  let lambdaInput = body
  let output = parseFunction(lambdaInput, env)
  let tempResult = output[0]
  if (input !== '') {
    output = spaceParser(input)
    if (output !== null) input = output[1]
  }
  tempResult = evalFunction(tempResult)
  return [tempResult, input]
}

const printParser = (input) => {
  let output = ''
  let tempResult = []
  if (input.startsWith('(print')) input = input.slice(6)
  else return null
  output = spaceParser(input)
  if (output !== null) input = output[1]
  else throw new Error(`Space is required after statement`)
  output = parseFunction(input)
  tempResult = output[0]
  input = output[1]
  while (input.startsWith(')')) {
    input = input.slice(1)
  }
  let value = evalFunction(tempResult)
  console.log(value)
  output = spaceParser(input)
  if (output !== null) input = output[1]
  return input
}

const storeIden = (tempResult, iden) => {
  if (ENV[iden] === undefined) ENV[iden] = tempResult
  else throw new Error(`${iden} is already defined`)
}

const evalParser = (tempResult) => {
  let result = []
  while (true) {
    if (tempResult.length === 1 && typeof tempResult[0] !== 'function') break
    let val = tempResult.pop()
    if (typeof val === 'function') {
      let res = val(result.reverse())
      result = []
      tempResult.push(res)
      if (tempResult.length === 1) break
    } else if (typeof val === 'object') {
        result.push(...val)
    } else {
      result.push(val)
    }
  }
  return tempResult[0]
}

const checkType = (input) => {
  if (typeof input === 'number') return input
  else if (typeof input === 'string') {
    if (ENV[input] !== undefined) return ENV[input]
    else throw new Error(`${input} is undefined`)
  }
  return input
}

const parse = (input) => {
  let tempResult = []
  if (input.startsWith('(')) {
    while (!input.startsWith(')')) {
      if (input.startsWith('(')) input = input.slice(1)
      let output = expressionParser(input)
      input = output[1]
      output = checkType(output[0])
      tempResult.push(output)
      output = spaceParser(input)
      if (output !== null) input = output[1]
    }
    while (input.startsWith(')')) input = input.slice(1)
  } else {
    let output = parserFactory(numParser, identifierParser)(input)
    input = output[1]
    output = checkType(output[0])
    tempResult = [output]
  }
  while (input.startsWith(')')) input = input.slice(1)
  return [tempResult, input]
}

const parseEval = (input) => {
  let output = parse(input)
  let tempResult = output[0]
  input = output[1]
  tempResult = evalParser(tempResult)

  return [tempResult, input]
}

const defineParser = (input) => {
  if (input.startsWith('(define')) input = input.slice(7)
  else return null
  input = spaceRequired(input)
  let output = identifierParser(input)
  let iden = output[0]
  input = spaceRequired(output[1])
  output = parseEval(input)
  input = output[1]
  storeIden(output[0], iden)
  output = spaceParser(input)
  if (output !== null) input = output[1]
  return input
}

const ifParser = (input) => {
  if (input.startsWith('(if')) input = input.slice(3)
  else return null
  input = spaceRequired(input)
  let output = parseEval(input)
  let test = output[0]
  input = spaceRequired(output[1])
  output = parseEval(input)
  let conseq = output[0]
  input = spaceRequired(output[1])
  output = parseEval(input)
  let alt = output[0]
  input = output[1]
  output = ifFun(test, conseq, alt)
  console.log(output)
  output = spaceParser(input)
  if (output !== null) input = output[1]
  return input
}

const justExpressionParser = (input) => {
  let output = parseEval(input)
  input = spaceRequired(output[1])
  console.log(output[0])
  return input
}

const statementParser = (input) => parserFactory(defineParser, printParser,
                                                 ifParser, justExpressionParser)(input)

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
