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

const expressionParser = (input) => {
  if (input.startsWith('(')) {
    input = input.slice(1)
    return parserFactory(numParser, operatorParser, identifierParser)(input)
  } else return parserFactory(numParser, identifierParser)(input)
}

const operatorParser = input => parserFactory(plusParser, minusParser, multiplyParser, divideParser, gteParser, lteParser, gtParser, ltParser, etParser, ifParser, maxParser, minParser, notParser, functionParser)(input)

const functionParser = input => {
  let output = ''
  let args = []
  if (input.startsWith('lambda')) {
    input = input.slice(7)
    if (!input.startsWith('(')) throw new Error('arguments must be in side brackets ()')
    input = input.slice(1)
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
    output = spaceParser(input)
    input = output[1]
    if (!input.startsWith('(')) throw new Error('body must be in side brackets ()')
    input = input.slice(1)
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
    let obj = {
      type: 'lambda',
      args: args,
      body: body,
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
  let match = input.match(/^[a-zA-Z]+/)
  if (match === null) return null
  let idStr = match[0]
  return [idStr, input.slice(idStr.length)]
}

const lambdaParser = (input, val) => {
  let output = ''
  let tempResult = []
  let result = []
  output = spaceParser(input)
  if (output !== null) {
    input = output[1]
  } else throw new Error('space is required')
  let obj = ENV[val]
  let {args, body, env} = obj
  args = args[0]
  let lambdaInput = body
  output = identifierParser(input) || numParser(input)
  if (output !== null) {
    input = output[1]
    let arg = output[0]
    if (typeof arg === 'number') {
      env[args] = arg
    } else if (typeof arg === 'string') {
      if (ENV[arg] !== undefined) {
        env[args] = ENV[arg]
      } else throw new Error(`${arg} is undefined`)
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
  }
  while (lambdaInput.startsWith(')')) {
    lambdaInput = lambdaInput.slice(1)
  }
  if (input !== '') {
    output = spaceParser(input)
    if (output !== null) {
      input = output[1]
    }
  }
  if (tempResult.length === 1) {
    return [tempResult, input]
  } else {
    while (true) {
      let someval = tempResult.pop()
      if (typeof someval === 'function') {
        let res = someval(...result.reverse())
        result = []
        tempResult.push(res)
        if (tempResult.length === 1) break
      } else {
        result.push(someval)
      }
    }
    return [tempResult, input]
  }
}

const statementParser = (input) => {
  let output = ''
  let tempResult = []
  let result = []
  if (input.startsWith('(')) {
    input = input.slice(1)
    if (input.startsWith('print')) {
      let val = ''
      input = input.slice(5)
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
                output = lambdaParser(input, val)
                val = output[0][0]
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
      input = input.slice(7)
      output = identifierParser(input)
      if (output !== null) {
        let iden = output[0]
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
}

const programParser = (input) => {
  while (true) {
    let output = ''
    output = spaceParser(input)
    if (output !== null) {
      input = output[1]
    }
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
  }
}

let input = fs.readFileSync('test.txt').toString()
let output = programParser(input)
console.log(output)
console.log(ENV)
