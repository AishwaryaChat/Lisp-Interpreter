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
const carFun = list => list.reverse()[0]
const cdrFun = list => list.reverse().slice(1)

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
const parseLambda = input => input.startsWith('lambda') ? ['lambda', input.slice(6)] : null
const parsePrint = input => input.startsWith('print') ? ['print', input.slice(5)] : null
const parseIf = input => input.startsWith('if') ? ['if', input.slice(2)] : null

const openBracket = input => input.startsWith('(') ? ['(', input.slice(1)] : null

const closeBracket = input => input.startsWith(')') ? [')', input.slice(1)] : null

const parserFactory = (...parsers) => (input, env) => {
  for (let parser of parsers) {
    let output = parser(input, env)
    if (output !== null) return output
  }
  return null
}

const allParsers = (...parsers) => input => {
  let result = []
  for (let parser of parsers) {
    let output = parser(input)
    if (output === null) return null
    result.push(output[0])
    input = output[1]
  }
  return [result, input]
}

const spaceParser = input => {
  let match = input.match(/^[\s\n]/)
  if (match === null) return null
  let spaceLt = match[0].length
  return [null, input.slice(spaceLt)]
}

const spaceRequired = (input) => spaceParser(input) ? spaceParser(input)[1]
                                 : new Error(`Space is required`)

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

const assignArgs = (funcObj, args) => {
  let params = funcObj.args
  let env = funcObj.env
  let i = 0
  while (i <= params.length - 1) {
    env[params[i]] = args[i]
    i++
  }
}

const findArugments = input => {
  let args = []
  while (closeBracket(input) === null) {
    let output = expressionParser(input)
    if (output !== null) {
      input = output[1]
      output = checkType(output[0])
      args.push(output)
    }
    output = spaceParser(input)
    if (output !== null) input = input.slice(1)
  }
  return [args, input]
}

const functionCallParser = input => {
  let funcObj = ''
  let args = []
  let rest = ''
  let output = openBracket(input)
  input = output[1]
  output = identifierParser(input)
  if (output !== null) {
    funcObj = output[0]
    if (ENV[funcObj] === undefined) throw new Error(`${funcObj} is undefined`)
    funcObj = ENV[funcObj]
    input = output[1]
    output = allParsers(spaceParser, findArugments, closeBracket)(input);
    [[, args], rest] = output
    input = rest
  } else {
    output = allParsers(lambdaParser, spaceParser, findArugments, closeBracket)(input);
    [[funcObj, , args], rest] = output
    input = rest
  }
  if (output === null) return null
  assignArgs(funcObj, args)
  let body = funcObj.body
  let env = funcObj.env
  output = operatorParser(body, env)
  return [output[0], input]
}

const expressionParser = (input, env) => parserFactory(numParser, identifierParser, operatorParser, functionCallParser)(input, env)

const bodyParser = input => {
  let output = openBracket(input)
  input = output[1]
  let body = '('
  let i = 1
  let j = 0
  let k = 0
  while (i !== j) {
    if (input[k] === '(') i++
    if (input[k] === ')') j++
    body = body + input[k]
    k++
  }
  input = input.substring(k)
  return [body, input]
}

const argumentsParser = input => {
  let output = openBracket(input)
  if (output !== null) {
    let args = []
    input = output[1]
    while (closeBracket(input) === null) {
      output = identifierParser(input)
      if (output !== null) {
        args.push(output[0])
        input = output[1]
      }
      output = spaceParser(input)
      if (output !== null) input = input.slice(1)
    }
    return [args, input.slice(1)]
  }
  return null
}

const lambdaParser = input => {
  let output = allParsers(openBracket, parseLambda, spaceParser, argumentsParser, spaceParser, bodyParser, closeBracket)(input)
  if (output !== null) {
    let [[, , , args, , body], rest] = output
    let obj = {
      type: 'lambda',
      args: args,
      body: body,
      env: {}
    }
    return [obj, rest]
  }
  return null
}

const evaluate = tempResult => {
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

const checkType = (input, env) => {
  if (typeof input === 'string') {
    if (env !== undefined) {
      if (env[input] !== undefined) input = env[input]
    }
    if (ENV[input] !== undefined) input = ENV[input]
  }
  return input
}

const operatorParser = (input, env) => {
  let tempResult = []
  let output = openBracket(input)
  if (output !== null) {
    input = output[1]
    output = parserFactory(plusParser, minusParser, multiplyParser, divideParser,
                         gteParser, lteParser, gtParser, ltParser, etParser,
                         maxParser, minParser, notParser, trueParser,
                         falseParser, listParser, carParser, cdrParser)(input)
    if (output !== null) {
      tempResult.push(output[0])
      input = spaceRequired(output[1])
    } else {
      return null
    }
    while (closeBracket(input) === null) {
      output = expressionParser(input, env)
      input = output[1]
      output = checkType(output[0], env)
      tempResult.push(output)
      output = spaceParser(input)
      if (output !== null) input = input.slice(1)
    }
    tempResult = evaluate(tempResult)
    return [tempResult, input.slice(1)]
  }
  return null
}

const storeIden = (id, val) => {
  if (ENV[id] === undefined) ENV[id] = val
  else throw new Error(`${id} is already defined`)
}

const ifParser = input => {
  let output = allParsers(openBracket, parseIf, spaceParser, expressionParser, spaceParser, expressionParser, spaceParser, expressionParser, closeBracket)(input)
  if (output === null) return null
  let [[, , , test, , conseq, , alt], rest] = output
  console.log(ifFun(test, conseq, alt))
  input = rest
  output = spaceParser(input)
  if (output !== null) input = output[1]
  return input
}

const defineParser = (input) => {
  let output = allParsers(openBracket, parseDefine, spaceParser, identifierParser, spaceParser)(input)
  if (output === null) return null
  let val = ''
  let [[, , , id], rest] = output
  input = rest
  output = lambdaParser(input)
  if (output === null) {
    output = expressionParser(input)
  }
  [val, rest] = output
  storeIden(id, val)
  input = rest
  output = closeBracket(input)
  input = output[1]
  output = spaceParser(input)
  if (output !== null) input = output[1]
  return input
}

const printParser = input => {
  let output = allParsers(openBracket, parsePrint, spaceParser, expressionParser, closeBracket)(input)
  if (output !== null) {
    let [[, , , val], rest] = output
    val = checkType(val)
    console.log(val)
    input = rest
    output = spaceParser(input)
    if (output !== null) input = output[1]
    return input
  }
  return null
}

const statementParser = (input) => parserFactory(defineParser, printParser, ifParser)(input)

const programParser = (code) => {
  while (code !== '' && code !== null) {
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
