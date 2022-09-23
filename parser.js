const ENV = {};
let OUTPUT = [];

class Parser {
  constructor() {
    this.ENV = {};
    this.OUTPUT = [];
  }
  // Lisp Functions
  plus = (list) => list.reduce((acc, item) => acc + item, 0);
  minus = (list) => list.reduce((acc, item) => acc - item);
  multiply = (list) => list.reduce((acc, item) => acc * item, 1);
  divide = (list) =>
    list[1] === 0 ? new Error(`Cannot divide by zero`) : list[0] / list[1];
  greaterThan = (list) => list[0] > list[1];
  lessThan = (list) => list[0] < list[1];
  gtEqTo = (list) => list[0] >= list[1];
  ltEqTo = (list) => list[0] <= list[1];
  eqTo = (list) => list[0] === list[1];
  ifFun = (a, b, c) => (a ? b : c);
  maxFun = (list) => Math.max(...list);
  minFun = (list) => Math.min(...list);
  notFun = (list) => !list[0];
  listFun = (list) => {
    return { type: "list", list };
  };
  carFun = (list) => [...list[0].list][0];
  cdrFun = (list) => [...list[0].list].slice(1);
  consFun = (list) => {
    let ele = list[0];
    list = list[1].list;
    list.unshift(ele);
    return list;
  };
  isListFun = (list) => list[0].type === "list";

  // Tokenizers
  plusParser = (input) =>
    input.startsWith("+") ? [this.plus, input.slice(1)] : null;
  minusParser = (input) =>
    input.startsWith("-") ? [this.minus, input.slice(1)] : null;
  multiplyParser = (input) =>
    input.startsWith("*") ? [this.multiply, input.slice(1)] : null;
  divideParser = (input) =>
    input.startsWith("/") ? [this.divide, input.slice(1)] : null;
  gtParser = (input) =>
    input.startsWith(">") ? [this.greaterThan, input.slice(1)] : null;
  ltParser = (input) =>
    input.startsWith("<") ? [this.lessThan, input.slice(1)] : null;
  gteParser = (input) =>
    input.startsWith(">=") ? [this.gtEqTo, input.slice(2)] : null;
  lteParser = (input) =>
    input.startsWith("<=") ? [this.ltEqTo, input.slice(2)] : null;
  etParser = (input) =>
    input.startsWith("==") ? [this.eqTo, input.slice(2)] : null;
  trueParser = (input) =>
    input.startsWith("true") ? [true, input.slice(4)] : null;
  falseParser = (input) =>
    input.startsWith("false") ? [false, input.slice(5)] : null;
  maxParser = (input) =>
    input.startsWith("max") ? [this.maxFun, input.slice(3)] : null;
  minParser = (input) =>
    input.startsWith("min") ? [this.minFun, input.slice(3)] : null;
  notParser = (input) =>
    input.startsWith("not") ? [this.notFun, input.slice(3)] : null;
  listParser = (input) =>
    input.startsWith("list") ? [this.listFun, input.slice(4)] : null;
  carParser = (input) =>
    input.startsWith("car") ? [this.carFun, input.slice(3)] : null;
  cdrParser = (input) =>
    input.startsWith("cdr") ? [this.cdrFun, input.slice(3)] : null;
  consParser = (input) =>
    input.startsWith("cons") ? [this.consFun, input.slice(4)] : null;
  isListParser = (input) =>
    input.startsWith("isList") ? [this.isListFun, input.slice(6)] : null;
  parseDefine = (input) =>
    input.startsWith("define") ? ["define", input.slice(6)] : null;
  parseLambda = (input) =>
    input.startsWith("lambda") ? ["lambda", input.slice(6)] : null;
  parsePrint = (input) =>
    input.startsWith("print") ? ["print", input.slice(5)] : null;
  parseIf = (input) => (input.startsWith("if") ? ["if", input.slice(2)] : null);

  openBracket = (input) =>
    input.startsWith("(") ? ["(", input.slice(1)] : null;

  closeBracket = (input) =>
    input.startsWith(")") ? [")", input.slice(1)] : null;

  parserFactory =
    (...parsers) =>
    (input, env) => {
      for (let parser of parsers) {
        let output = parser(input, env);
        if (output !== null) return output;
      }
      return null;
    };

  allParsers =
    (...parsers) =>
    (input) => {
      let result = [];
      for (let parser of parsers) {
        let output = parser(input);
        if (output === null) return null;
        result.push(output[0]);
        input = output[1];
      }
      return [result, input];
    };

  spaceParser = (input) => {
    let match = input.match(/^[\s\n]/);
    if (match === null) return null;
    let spaceLt = match[0].length;
    return [null, input.slice(spaceLt)];
  };

  spaceRequired = (input) =>
    this.spaceParser(input)
      ? this.spaceParser(input)[1]
      : new Error(`Space is required`);

  numParser = (input) => {
    let match = input.match(/^[-+]?(\d+(\.\d*)?|\.\d+)([e][+-]?\d+)?/);
    if (match === null) return null;
    let numStr = match[0];
    return [parseInt(numStr), input.slice(numStr.length)];
  };

  stringParser(input) {
    let i = 1;
    if (input.startsWith('"')) {
      let s = "";
      while (input[i] !== '"') {
        if (input[i] === "\\") {
          s = s + input.substr(i, 2);
          i += 2;
        } else {
          s = s + input[i];
          i++;
        }
      }
      return [s, input.slice(i + 1)];
    }
    return null;
  }

  identifierParser = (input) => {
    let match = input.match(/^[a-zA-Z]+[0-9]*[a-zA-Z]*/);
    if (match === null) return null;
    let idStr = match[0];
    return [idStr, input.slice(idStr.length)];
  };

  definedFun = (input) => {
    let funcObj = input[0];
    input = input[1];
    if (this.ENV[funcObj] === undefined)
      throw new Error(`${funcObj} is undefined`);
    funcObj = this.ENV[funcObj];
    let output = this.allParsers(
      this.spaceParser,
      this.findArugments,
      this.closeBracket
    )(input);
    let [[, args], rest] = output;
    input = rest;
    return [funcObj, args, rest];
  };

  iife = (input) => {
    let output = this.allParsers(
      this.lambdaParser,
      this.spaceParser,
      this.findArugments,
      this.closeBracket
    )(input);
    let [[funcObj, , args], rest] = output;
    input = rest;
    return [funcObj, args, rest];
  };

  findType = (input) => {
    let output = this.identifierParser(input);
    if (output !== null) output = this.definedFun(output);
    else output = this.iife(input);
    return output;
  };

  assignArgs = (funcObj, args) => {
    let params = funcObj.args;
    let env = funcObj.env;
    let i = 0;
    while (i <= params.length - 1) {
      env[params[i]] = args[i];
      i++;
    }
  };

  findArugments = (input) => {
    let args = [];
    while (this.closeBracket(input) === null) {
      let output = this.expressionParser(input);
      if (output !== null) {
        input = output[1];
        output = this.checkType(output[0]);
        args.push(output);
      }
      output = this.spaceParser(input);
      if (output !== null) input = input.slice(1);
    }
    return [args, input];
  };

  functionCallParser = (input) => {
    let output = this.openBracket(input);
    input = output[1];
    output = this.findType(input);
    if (output === null) return null;
    let [funcObj, args, rest] = output;
    input = rest;
    this.assignArgs(funcObj, args);
    output = this.operatorParser(funcObj.body, funcObj.env);
    return [output[0], input];
  };

  expressionParser = (input, env) =>
    this.parserFactory(
      this.numParser,
      this.stringParser,
      this.identifierParser,
      this.operatorParser,
      this.functionCallParser
    )(input, env);

  bodyParser = (input) => {
    let output = this.openBracket(input);
    input = output[1];
    let body = "(";
    let i = 1;
    let j = 0;
    let k = 0;
    while (i !== j) {
      if (input[k] === "(") i++;
      if (input[k] === ")") j++;
      body = body + input[k];
      k++;
    }
    input = input.substring(k);
    return [body, input];
  };

  parseArguments = (input) => {
    let args = [];
    while (this.closeBracket(input) === null) {
      let output = this.identifierParser(input);
      if (output !== null) {
        args.push(output[0]);
        input = output[1];
      }
      output = this.spaceParser(input);
      if (output !== null) input = input.slice(1);
    }
    return [args, input];
  };

  argumentsParser = (input) => {
    let output = this.openBracket(input);
    if (output !== null) {
      let args = [];
      input = output[1];
      [args, input] = this.parseArguments(input);
      return [args, input.slice(1)];
    }
    return null;
  };

  lambdaParser = (input) => {
    let output = this.allParsers(
      this.openBracket,
      this.parseLambda,
      this.spaceParser,
      this.argumentsParser,
      this.spaceParser,
      this.bodyParser,
      this.closeBracket
    )(input);
    if (output !== null) {
      let [[, , , args, , body], rest] = output;
      let obj = {
        type: "lambda",
        args: args,
        body: body,
        env: {},
      };
      return [obj, rest];
    }
    return null;
  };

  evaluate = (tempResult) => {
    let result = [];
    while (true) {
      if (tempResult.length === 1 && typeof tempResult[0] !== "function") break;
      let val = tempResult.pop();

      if (typeof val === "function") {
        let res = val(result.reverse());
        result = [];
        tempResult.push(res);
        if (tempResult.length === 1) break;
      } else if (typeof val === "object") {
        result.push(val);
      } else {
        result.push(val);
      }
    }
    return tempResult[0];
  };

  checkType = (input, env) => {
    if (typeof input === "string") {
      if (env !== undefined) {
        if (env[input] !== undefined) input = env[input];
      } else if (this.ENV[input] !== undefined) {
        input = this.ENV[input];
      } else if (this.ENV[input] === undefined)
        throw new Error(`${input} is undefined`);
    }
    return input;
  };

  parseExpression = (input, tempResult, env) => {
    while (this.closeBracket(input) === null) {
      let output = this.expressionParser(input, env);
      input = output[1];
      output = this.checkType(output[0], env);
      tempResult.push(output);
      output = this.spaceParser(input);
      if (output !== null) input = input.slice(1);
    }
    return [tempResult, input];
  };

  operatorParser = (input, env) => {
    let tempResult = [];
    let output = this.openBracket(input);
    if (output !== null) {
      input = output[1];
      output = this.parserFactory(
        this.plusParser,
        this.minusParser,
        this.multiplyParser,
        this.divideParser,
        this.gteParser,
        this.lteParser,
        this.gtParser,
        this.ltParser,
        this.etParser,
        this.maxParser,
        this.minParser,
        this.notParser,
        this.trueParser,
        this.consParser,
        this.falseParser,
        this.listParser,
        this.carParser,
        this.cdrParser,
        this.isListParser
      )(input);
      if (output !== null) {
        tempResult.push(output[0]);
        input = this.spaceRequired(output[1]);
      } else {
        return null;
      }
      [tempResult, input] = this.parseExpression(input, tempResult, env);
      tempResult = this.evaluate(tempResult);
      return [tempResult, input.slice(1)];
    }
    return null;
  };

  storeIden = (id, val) => {
    if (this.ENV[id] === undefined) this.ENV[id] = val;
    else throw new Error(`${id} is already defined`);
  };

  ifParser = (input) => {
    let output = this.allParsers(
      this.openBracket,
      this.parseIf,
      this.spaceParser,
      this.expressionParser,
      this.spaceParser,
      this.expressionParser,
      this.spaceParser,
      this.expressionParser,
      this.closeBracket
    )(input);
    if (output === null) return null;
    let [[, , , test, , conseq, , alt], rest] = output;
    this.OUTPUT.push(this.ifFun(test, conseq, alt));
    // console.log(ifFun(test, conseq, alt));
    input = rest;
    output = this.spaceParser(input);
    if (output !== null) input = output[1];
    return input;
  };

  defineParser = (input) => {
    let output = this.allParsers(
      this.openBracket,
      this.parseDefine,
      this.spaceParser,
      this.identifierParser,
      this.spaceParser
    )(input);
    if (output === null) return null;
    let val = "";
    let [[, , , id], rest] = output;
    input = rest;
    output = this.lambdaParser(input);
    if (output === null) output = this.expressionParser(input);
    [val, rest] = output;
    this.storeIden(id, val);
    output = this.closeBracket(rest);
    input = output[1];
    output = this.spaceParser(input);
    if (output !== null) input = output[1];
    return input;
  };

  printParser = (input) => {
    let output = this.allParsers(
      this.openBracket,
      this.parsePrint,
      this.spaceParser,
      this.expressionParser,
      this.closeBracket
    )(input);
    if (output !== null) {
      let [[, , , val], rest] = output;
      val = this.checkType(val);
      this.OUTPUT.push(val);
      // console.log(val);
      input = rest;
      output = this.spaceParser(input);
      if (output !== null) input = output[1];
      return input;
    }
    return null;
  };

  statementParser = (input) =>
    this.parserFactory(
      this.defineParser,
      this.printParser,
      this.ifParser
    )(input);

  programParser = (code) => {
    while (code !== "" && code !== null) {
      let output = "";
      output = this.spaceParser(code);
      if (output !== null) {
        code = output[1];
      }
      output = this.statementParser(code);
      code = output;
    }
    return this.OUTPUT;
  };
}

const parseProgram = (input) => {
  const parserNew = new Parser();
  try {
    return parserNew.programParser(input);
  } catch (error) {
    console.log("error.", error.message)
    throw new Error(error.message)
  }
};

module.exports = parseProgram;
