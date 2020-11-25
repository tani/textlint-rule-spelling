/*
 * This file is part of textlint-rule-spelling
 *
 * textlint-rule-spelling is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * textlint-rule-spelling is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with textlint-rule-spelling.  If not, see <http://www.gnu.org/licenses/>.
 */
"use strict";

const fs = require("fs");
const path = require("path");
const nspell = require("nspell");
const { matchPatterns } = require("@textlint/regexp-string-matcher");

const constructNSpell = function (language) {
  const base = require.resolve(`dictionary-${language}`);
  const dictionary = fs.readFileSync(
    path.join(base, "..", "index.dic"),
    "utf-8"
  );
  const affix = fs.readFileSync(path.join(base, "..", "index.aff"), "utf-8");
  return nspell(affix, dictionary);
};

const getRuleErrorBuilder = (nSpell, suggestCorrections, RuleError, fixer) => {
  if (suggestCorrections) {
    return (word, originalRange) => {
      const suggestions = nSpell.suggest(word);
      const fix =
        suggestions.length === 1
          ? fixer.replaceTextRange(originalRange, suggestions[0])
          : undefined;
      const message = `${word} -> ${suggestions.join(", ")}`;
      return new RuleError(message, {
        index: originalRange[0],
        fix: fix,
      });
    };
  } else {
    return (word, originalRange) => {
      return new RuleError(word, {
        index: originalRange[0],
      });
    };
  }
};

const doesExclusionOverlapWord = (
  [exclusionRangeStart, exclusionRangeEnd],
  [wordRangeStart, wordRangeEnd]
) => {
  const startsBeforeEndOfExclusion = wordRangeStart <= exclusionRangeEnd;
  const endsAfterStartOfExclusion = wordRangeEnd >= exclusionRangeStart;
  return startsBeforeEndOfExclusion && endsAfterStartOfExclusion;
};

const getNoExclusionsOverlapWord = (exclusions, indexOffset) => {
  if (exclusions && exclusions.length > 0) {
    return (originalRange) => {
      return !exclusions.some(({ startIndex, endIndex }) =>
        doesExclusionOverlapWord(
          [startIndex + indexOffset, endIndex + indexOffset],
          originalRange
        )
      );
    };
  }
  return (originalRange) => true;
};

const reporter = function (
  { Syntax, RuleError, fixer, report },
  {
    language = "en",
    skipPatterns = [],
    wordDefinitionRegexp: optionWordDefinitionRegexp = /\b[\w']+\b/g,
    suggestCorrections = true,
  }
) {
  const nSpell = constructNSpell(language);

  const ruleErrorBuilder = getRuleErrorBuilder(
    nSpell,
    suggestCorrections,
    RuleError,
    fixer
  );

  const handleText = (node, text, indexOffset) => {
    if (!text) return;
    const wordDefinitionRegexp = new RegExp(optionWordDefinitionRegexp);

    let noExclusionsOverlapWord;

    while (true) {
      const matches = wordDefinitionRegexp.exec(text);
      if (matches === null) {
        break;
      }
      if (matches.index === wordDefinitionRegexp.lastIndex) {
        wordDefinitionRegexp.lastIndex++;
      }
      const originalIndex = indexOffset + matches.index;
      const word = matches[0];

      const originalWordRange = [originalIndex, originalIndex + word.length];

      if (!nSpell.correct(word)) {
        noExclusionsOverlapWord =
          noExclusionsOverlapWord ||
          getNoExclusionsOverlapWord(
            matchPatterns(text, skipPatterns),
            indexOffset
          );
        if (noExclusionsOverlapWord(originalWordRange)) {
          report(node, ruleErrorBuilder(word, originalWordRange));
        }
      }
    }
  };

  return {
    [Syntax.Str](node) {
      const { value } = node;
      handleText(node, value, 0);
    },
    [Syntax.Link](node) {
      const { title, raw } = node;
      handleText(node, title, raw.indexOf(title));
    },
    [Syntax.Image](node) {
      const { alt, title, raw } = node;

      if (alt) {
        const indexOfAlt = raw.indexOf(alt);
        handleText(node, alt, indexOfAlt);
      }
      if (title) {
        const indexOfTitle = raw.indexOf(title);
        handleText(node, title, indexOfTitle);
      }
    },
  };
};

module.exports = {
  linter: reporter,
  fixer: reporter,
};
