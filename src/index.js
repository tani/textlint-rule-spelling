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
const { StringSource } = require("textlint-util-to-string");
const { matchPatterns } = require("@textlint/regexp-string-matcher");
const { RuleHelper, IgnoreNodeManager } = require("textlint-rule-helper");

const constructNSpell = function (language) {
  const base = require.resolve(`dictionary-${language}`);
  const dictionary = fs.readFileSync(
    path.join(base, "..", "index.dic"),
    "utf-8"
  );
  const affix = fs.readFileSync(path.join(base, "..", "index.aff"), "utf-8");
  return nspell(affix, dictionary);
};

const doesContain = (source, exclude, originalRange) =>
  source.originalIndexFromIndex(exclude.startIndex) <= originalRange[0] &&
  originalRange[1] <= source.originalIndexFromIndex(exclude.endIndex);

const reporter = function (context, options) {
  const { Syntax, RuleError, fixer, report } = context;
  const { language = "en", skipPatterns = [], optWordDefinitionExpression = /[\w']+/g } = options;
  const spell = constructNSpell(language);
  const ignoreNodeManager = new IgnoreNodeManager();

  const skipNodeTypes = [Syntax.Link, Syntax.Image];

  const filterNode = (node) => {
    const helper = new RuleHelper(context);

    if (helper.isChildNode(node, skipNodeTypes)) {
      return {};
    }

    if (skipNodeTypes && skipNodeTypes.length > 0) {
      ignoreNodeManager.ignoreChildrenByTypes(node, skipNodeTypes);
    }

    const source = new StringSource(node);
    const text = source.toString();

    return { source, text };
  };

  return {
    [Syntax.Paragraph](node) {
      const { source, text } = filterNode(node);
      const wordDefinitionExpression = optWordDefinitionExpression && optWordDefinitionExpression.exec ? optWordDefinitionExpression : new RegExp(optWordDefinitionExpression);
      for (
        let matches = wordDefinitionExpression.exec(text);
        matches !== null;
        matches = wordDefinitionExpression.exec(text)
      ) {
        const originalIndex = source.originalIndexFromIndex(matches.index);
        const originalRange = [
          originalIndex,
          originalIndex + matches[0].length,
        ];

        // if range is ignored, not report
        if (ignoreNodeManager.isIgnoredRange(originalRange)) {
          break;
        }
        const excludes = matchPatterns(text, skipPatterns);
        if (
          !excludes.some((exclude) =>
            doesContain(source, exclude, originalRange)
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
    },
  };
};

module.exports = {
  linter: reporter,
  fixer: reporter,
};
