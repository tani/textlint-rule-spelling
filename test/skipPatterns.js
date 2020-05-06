"use strict";
const TextLintTester = require("textlint-tester");
const tester = new TextLintTester();
const rule = require("../src/index");

tester.run(
  "spelling skipPatterns npm",
  {
    rules: [
      {
        ruleId: "spelling",
        rule,
        options: { language: "en", skipPatterns: ["/\\bnpm\\b/"] },
      },
    ],
  },
  {
    valid: [
      {
        text: "npm is amazing",
      },
    ],
    invalid: [
      {
        text: "npmm is amazing",
        errors: [
          {
            message:
              "npmm -> ppm, bpm, hmm, pm, rpm, wpm, comm, mm, norm, pom, spam, name, numb",
            line: 1,
            column: 1,
          },
        ],
      },
    ],
  }
);

tester.run(
  "spelling skipPatterns npmm",
  {
    rules: [
      {
        ruleId: "spelling",
        rule,
        options: { language: "en", skipPatterns: ["/\\bnpmm\\b/"] },
      },
    ],
  },
  {
    valid: [
      {
        text: "npmm is amazing",
      },
    ],
    invalid: [
      {
        text: "npm is amazing",
        errors: [
          {
            message: "npm -> bpm, pm, ppm, rpm, wpm, Nam, NM, Np, NPR",
            line: 1,
            column: 1,
          },
        ],
      },
    ],
  }
);

tester.testValidPattern(
  "spelling skipPatterns regex",
  { rules: [{ rule, options: { skipPatterns: ["/\\{[#=\\w]+\\}/"] } }] },
  {
    text: "# Test header with id {#idTestHeader}",
  }
);
tester.testValidPattern(
  "spelling skipPatterns regex",
  { rules: [{ rule, options: { skipPatterns: ["/\\{[\\.#=\\w]+\\}/"] } }] },
  {
    text: "# Test header with class {.classTestHeader}",
  }
);
tester.testValidPattern(
  "spelling skipPatterns regex",
  { rules: [{ rule, options: { skipPatterns: ["/\\{[\\.#=\\w]+\\}/"] } }] },
  {
    text: "# Test header with prop {prop=propTestHeader}",
  }
);
