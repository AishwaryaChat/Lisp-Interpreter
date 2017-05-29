const plusParser = (input) => input.startsWith('+') ? ['+', input.slice(1)] : null
const spaceParser = (input) => input.match(/^[\s\n]/) ? [null, input.slice(input.match(/\S/).index)] : null
const  numParser = (input) => {
  let regexp = String(input).match(/^[-+]?(\d+(\.\d*)?|\.\d+)([e][+-]?\d+)?/)
  if (!String(input).match(/^[-+]?(\d+(\.\d*)?|\.\d+)([e][+-]?\d+)?/)) return null
  return [parseInt(regexp[0]), input.slice(regexp[0].length)]
}

let input = '1'
let output = numParser(input)
console.log(output)
