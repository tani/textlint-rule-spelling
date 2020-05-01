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
        options: { optWordDefinitionExpression: /[\w']+/g },
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
