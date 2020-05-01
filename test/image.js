"use strict";
const TextLintTester = require("textlint-tester");
const tester = new TextLintTester();
const rule = require("../src/index");

tester.run(
  "spelling with images",
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
      `Text:
      ![Explosion](https://media.giphy.com/media/XUFPGrX5Zis6Y/giphy.gif "nuclear explosion")
      Some more text here`,
      '![Explosion](https://media.giphy.com/media/XUFPGrX5Zis6Y/giphy.gif "nuclear explosion")',
    ],
    invalid: [
      {
        text:
          '![Dxplosion](https://media.giphy.com/media/XUFPGrX5Zis6Y/giphy.gif "nuclear Explosion")',
        output:
          '![explosion](https://media.giphy.com/media/XUFPGrX5Zis6Y/giphy.gif "nuclear Explosion")',
        errors: [
          {
            message: "Dxplosion -> explosion",
            line: 1,
            column: 3,
          },
        ],
      },
      {
        text: `![Explosion](https://media.giphy.com/media/XUFPGrX5Zis6Y/giphy.gif "nuclear dxplosion")`,
        output: `![Explosion](https://media.giphy.com/media/XUFPGrX5Zis6Y/giphy.gif "nuclear explosion")`,
        errors: [
          {
            message: "dxplosion -> explosion",
            line: 1,
            column: 77,
          },
        ],
      },
      {
        text: `text
          ![Explosion](https://media.giphy.com/media/XUFPGrX5Zis6Y/giphy.gif "nuclear dxplosion")
          text`,
        output: `text
          ![Explosion](https://media.giphy.com/media/XUFPGrX5Zis6Y/giphy.gif "nuclear explosion")
          text`,
        errors: [
          {
            message: "dxplosion -> explosion",
            line: 2,
            column: 87,
          },
        ],
      },
      {
        text: `texxt
          ![Explosion](https://media.giphy.com/media/XUFPGrX5Zis6Y/giphy.gif "nuclear dxplosion")
          text`,
        output: `text
          ![Explosion](https://media.giphy.com/media/XUFPGrX5Zis6Y/giphy.gif "nuclear explosion")
          text`,
        errors: [
          {
            message: "texxt -> text",
            line: 1,
            column: 1,
          },
          {
            message: "dxplosion -> explosion",
            line: 2,
            column: 87,
          },
        ],
      },
      {
        text: `![Explosion](https://media.giphy.com/media/XUFPGrX5Zis6Y/giphy.gif "nuclear dxplosion")
          ![Explosion](https://media.giphy.com/media/XUFPGrX5Zis6Y/giphy.gif "nuclear dxplosion")
          text`,
        output: `![Explosion](https://media.giphy.com/media/XUFPGrX5Zis6Y/giphy.gif "nuclear explosion")
          ![Explosion](https://media.giphy.com/media/XUFPGrX5Zis6Y/giphy.gif "nuclear explosion")
          text`,
        errors: [
          {
            message: "dxplosion -> explosion",
            line: 1,
            column: 77,
          },
          {
            message: "dxplosion -> explosion",
            line: 2,
            column: 87,
          },
        ],
      },
      {
        text: `Text: 
          ![Explosion](https://media.giphy.com/media/XUFPGrX5Zis6Y/giphy.gif "nuclear dxplosion")
          Some more texxt here`,
        output: `Text: 
          ![Explosion](https://media.giphy.com/media/XUFPGrX5Zis6Y/giphy.gif "nuclear explosion")
          Some more text here`,
        errors: [
          {
            message: "dxplosion -> explosion",
            line: 2,
            column: 87,
          },
          {
            message: "texxt -> text",
            line: 3,
            column: 21,
          },
        ],
      },
    ],
  }
);

tester.run(
  "spelling with images and skipPattern",
  {
    rules: [
      {
        ruleId: "spelling",
        rule,
        options: { language: "en", skipPatterns: ["/npm(\\b|$)/mi"] },
      },
    ],
  },
  {
    valid: [
      `![Explosion of npm](https://media.giphy.com/media/XUFPGrX5Zis6Y/giphy.gif "nuclear explosion")`,
      '![Explosion](https://media.giphy.com/media/XUFPGrX5Zis6Y/giphy.gif "nuclear explosion of npm")',
    ],
    invalid: [
      {
        text:
          '![Explosion of npmm](https://media.giphy.com/media/XUFPGrX5Zis6Y/giphy.gif "nuclear Explosion")',
        errors: [
          {
            message:
              "npmm -> ppm, bpm, hmm, pm, rpm, wpm, comm, mm, norm, pom, spam, name, numb",
            line: 1,
            column: 16,
          },
        ],
      },
      {
        text: `![Explosion](https://media.giphy.com/media/XUFPGrX5Zis6Y/giphy.gif "nuclear explosion of npmm")`,
        errors: [
          {
            message:
              "npmm -> ppm, bpm, hmm, pm, rpm, wpm, comm, mm, norm, pom, spam, name, numb",
            line: 1,
            column: 90,
          },
        ],
      },
    ],
  }
);
