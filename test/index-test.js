"use strict";
const TextLintTester = require("textlint-tester");
const tester = new TextLintTester();
const rule = require("../src/index");

tester.run(
  "spelling",
  {
    rules: [
      {
        ruleId: "spelling",
        rule,
        options: { language: "en-us", skipPatterns: ["npm"] }
      }
    ]
  },
  {
    valid: ["text", "npm"],
    invalid: [
      {
        text: "It is colour.",
        output: "It is color.",
        errors: [
          {
            message: "colour -> color",
            line: 1,
            column: 7
          }
        ]
      },
      {
        text: `It has many colour.

One more colour`,
        output: `It has many color.

One more color`,
        errors: [
          {
            message: "colour -> color",
            line: 1,
            column: 13
          },
          {
            message: "colour -> color",
            line: 3,
            column: 10
          }
        ]
      }
    ]
  }
);
