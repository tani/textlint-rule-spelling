"use strict";
const TextLintTester = require("textlint-tester");
const tester = new TextLintTester();
const rule = require("../src/index");

tester.run(
  "spelling with links",
  {
    rules: [
      {
        ruleId: "spelling",
        rule,
        options: { language: "en" },
      },
    ],
  },
  {
    valid: [
      "[text](https:///www.google.com)",
      '[text](https:///www.google.com "title goes here")',
    ],
    invalid: [
      {
        text: "[texxt](https:///www.google.com)",
        output: "[text](https:///www.google.com)",
        errors: [
          {
            message: "texxt -> text",
            line: 1,
            column: 2,
          },
        ],
      },
      {
        text: `[texxt](https:///www.google.com "title goes heerre")`,
        output: `[text](https:///www.google.com "title goes here")`,
        errors: [
          {
            message: "texxt -> text",
            line: 1,
            column: 2,
          },
          {
            message: "heerre -> here",
            line: 1,
            column: 45,
          },
        ],
      },
      {
        text: `errur before
[texxt](https:///www.google.com)
errur after`,
        output: `error before
[text](https:///www.google.com)
error after`,
        errors: [
          {
            message: "errur -> error",
            line: 1,
            column: 1,
          },
          {
            message: "texxt -> text",
            line: 2,
            column: 2,
          },
          {
            message: "errur -> error",
            line: 3,
            column: 1,
          },
        ],
      },
    ],
  }
);
