const plusParser = (input) => input.startsWith('+') ? ['+', input.slice(1)] : null
const spaceParser = (input) => input.match(/^[\s\n]/) ? [null, input.slice(input.match(/\S/).index)] : null
