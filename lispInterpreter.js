const plusParser = input => input.startsWith('+') ? [plus, input.slice(1)] : null
const minusParser = input => input.startsWith('-') ? [minus, input.slice(1)] : null
const multiplyParser = input => input.startsWith('*') ? [multiply, input.slice(1)] : null
const divideParser = input => input.startsWith('/') ? [divide, input.slice(1)] : null
const spaceParser = input => input.match(/^[\s\n]/) ? [null, input.slice(input.match(/\S/).index)] : null
const  numParser = input => {
  let regexp = String(input).match(/^[-+]?(\d+(\.\d*)?|\.\d+)([e][+-]?\d+)?/)
  if (!String(input).match(/^[-+]?(\d+(\.\d*)?|\.\d+)([e][+-]?\d+)?/)) return null
  return [parseInt(regexp[0]), input.slice(regexp[0].length)]
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

let result = []
let input = '/ 10 10'
let output = divideParser(input)
result.push(output[0])
output = spaceParser(output[1])
output = numParser(output[1])
result.push(output[0])
output = spaceParser(output[1])
output = numParser(output[1])
result.push(output[0])
const fun = result.shift()
output = fun(...result)
console.log(output)
