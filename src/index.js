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

const doesContain = (
  exclude,
  [originalRangeStart, originalRangeEnd],
  indexOffset
) => {
  const startssBeforeEndOfExclusion =
    originalRangeStart <= exclude.endIndex + indexOffset;
  const endsAfterStartOfExclusion =
    originalRangeEnd >= exclude.startIndex + indexOffset;
  return startssBeforeEndOfExclusion && endsAfterStartOfExclusion;
};

const reporter = function (context, options) {
  const { Syntax, RuleError, fixer, report } = context;
  const {
    language = "en",
    skipPatterns = [],
    optWordDefinitionExpression = /[\w']+/g,
  } = options;
  const spell = constructNSpell(language);

  const handleText = (node, text, indexOffset) => {
    if (!text) return;
    const wordDefinitionExpression = new RegExp(optWordDefinitionExpression);
    let matches;

    while ((matches = wordDefinitionExpression.exec(text)) !== null) {
      // This is necessary to avoid infinite loops with zero-width matches
      if (matches.index === wordDefinitionExpression.lastIndex) {
        wordDefinitionExpression.lastIndex++;
      }
      const originalIndex = indexOffset + matches.index;

      const originalRange = [originalIndex, originalIndex + matches[0].length];

      const excludes = matchPatterns(text, skipPatterns);
      if (
        !excludes.some((exclude) =>
          doesContain(exclude, originalRange, indexOffset)
        ) &&
        !spell.correct(matches[0])
      ) {
        const suggestions = spell.suggest(matches[0]);
        const fix =
          suggestions.length === 1
            ? fixer.replaceTextRange(originalRange, suggestions[0])
            : undefined;
        const message = `${matches[0]} -> ${suggestions.join(", ")}`;
        const ruleError = new RuleError(message, {
          index: originalIndex,
          fix: fix,
        });
        report(node, ruleError);
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
