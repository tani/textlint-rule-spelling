# textlint-rule-spelling [![Build Status](https://dev.azure.com/ta2gch/ta2gch/_apis/build/status/ta2gch.textlint-rule-spelling?branchName=master)](https://dev.azure.com/ta2gch/ta2gch/_build/latest?definitionId=3&branchName=master)

A textlint rule for spelling of languages as much as possible

## Install

Install with [npm](https://www.npmjs.com/):

    npm install textlint-rule-spelling dictionary-en-us # or dictionary-fr, ...

## Usage

Via `.textlintrc`(Recommended)

```json
{
    "rules": {
        "spelling": {
        "language": "en-us",
            "skipPatterns": ["JavaScript"]
        }
    }
}
```

Via CLI

```
textlint --rule spelling README.md
```

### Build

Builds source codes for publish to the `lib` folder.
You can write ES2015+ source codes in `src/` folder.

    npm run build

### Tests

Run test code in `test` folder.
Test textlint rule by [textlint-tester](https://github.com/textlint/textlint-tester "textlint-tester").

    npm test

## License

GPL-3.0-or-later © TANIGUCHI Masaya
