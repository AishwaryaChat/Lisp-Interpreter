#!/usr/bin/env node

"use strict";

const minimist =  require("minimist");
const fs = require("fs")
const programParser = require("./parser.js")

const args = minimist(process.argv.slice(2))

if(args.help) {
    printHelp()
}

if(args.file) {
    processFile(args.file)
}

function processFile(filepath) {
    const file = fs.readFileSync(filepath).toString()
    programParser(file)
}

function printHelp() {
    console.log("ussage: ")
    console.log("--help                             print this help")
    console.log("--file={FILEPATH}                  process the file")
}