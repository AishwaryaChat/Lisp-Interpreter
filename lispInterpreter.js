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
  let output
  while (true) {
    if (input.startsWith('(')) {
      input = input.slice(1)
      if (input.startsWith('print')) {
        input = input.slice(6)
        output = numParser(input) || identifierParser(input)
        console.log(output[0])
        input = output[1]
        if (!output[1].startsWith(')')) return null
        input = input.slice(1)
        if (input !== null) {
          output = spaceParser(input)
          if (output !== null) {
            input = output[1]
          }
        }
        if (input === '') break
      }
    }
  }
}

const printFun = () => {

}

let input = `(print 10)
(print a)(print 9)
(print 50)
(print b)(print 20)`
let output = statementParser(input)
