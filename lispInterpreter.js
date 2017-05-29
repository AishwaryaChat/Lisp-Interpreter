const plusParser = (input) => input.startsWith('+') ? ['+', input.slice(1)] : null

let input = '+ 1 2'
let output = plusParser(input)
console.log(output)
