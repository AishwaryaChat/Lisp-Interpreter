const parser = require("../parser");
const Input1 = require("./test1");
const Input2 = require("./test2");
const Input3 = require("./test3");

describe("Parser Testcases: ", () => {
  it("should successfully parse the script without throwing error", () => {
    const expectedOutput = [
      10,
      302,
      3060,
      400,
      91204,
      656,
      124,
      9,
      0.33112582781456956,
      false,
      50,
      100,
      33,
      3,
      [302, 1],
      [55, 3, 302, 1],
      true,
    ];
    const output = parser(Input1);
    expect(output).toStrictEqual(expectedOutput);
  });
  it("should return empty arry []", () => {
    const output = parser(Input2);
    expect(output).toStrictEqual([]);
  });
  it("it should throw an error", () => {
    expect(() => {
      parser(Input3);
    }).toThrowError();
  });
});
