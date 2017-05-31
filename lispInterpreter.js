const fs = require('fs')
const ENV = {}

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

const statementParser = (input) => {
  if (input.startsWith('(')) {
    let output = ''
    input = input.slice(1)
    while (true) {
      if (input.startsWith('print')) {
        input = input.slice(6)
        output = identifierParser(input)
        if (output !== null) {
          let val = ENV[output[0]]
          if (val === undefined) {
            console.log('Error ', output[0], ' is not defined')
            break
          } else {
            console.log(val)
          }
        } else {
          output = numParser(input)
          console.log(output[0])
        }
        input = output[1]
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
      } else break
    }
    if (!input.startsWith(')')) return null
    input = input.slice(1)
    if (input !== '') {
      output = spaceParser(input)
      if (output !== null) {
        input = output[1]
        output = statementParser(input)
      } else statementParser(input)
    }
  }
}

const defFun = (a, b) => { ENV[a] = b }

let input = fs.readFileSync('test.txt').toString()
let output = statementParser(input)
