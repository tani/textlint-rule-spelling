"use strict";
const TextLintTester = require("textlint-tester");
const tester = new TextLintTester();
const rule = require("../src/index");

tester.run(
  "spelling with word definition",
  {
    rules: [
      {
        ruleId: "spelling",
        rule,
        options: { wordDefinitionRegexp: /[\w']+/g },
      },
    ],
  },
  {
    valid: [
      //   `will-o'-the-wisp`,
      `Fifty-six`,
      `three-year-old children`,
      `A triplet of three year-old children`,
      `self-serving reasons`,
      `president-elect`,
      `ex-wife`,
    ],
    invalid: [
      //   {
      //     text: `can-o'-worms`,
      //     errors: [
      //       {
      //         message: "can-o'-worms -> ",
      //         line: 1,
      //         column: 1,
      //       },
      //     ],
      //   },
    ],
  }
);

tester.run(
  "spelling with word definition from string-based configuration",
  {
    rules: [
      {
        ruleId: "spelling",
        rule,
        options: { wordDefinitionRegexp: "[\\w']+" },
      },
    ],
  },
  {
    valid: [
      `Fifty-six`,
      `three-year-old children`,
      `A triplet of three year-old children`,
      `self-serving reasons`,
      `president-elect`,
      `ex-wife`,
    ],
    invalid: [
      {
        text: "It is colour.",
        output: "It is color.",
        errors: [
          {
            message: "colour -> color",
            line: 1,
            column: 7,
          },
        ],
      },
    ],
  }
);
