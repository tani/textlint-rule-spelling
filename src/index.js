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
 * along with textlint-plugin-latex2e.  If not, see <http://www.gnu.org/licenses/>.
 */
"use strict";
// eslint-disable-next-line no-unused-vars
const regeneratorRuntime = require("regenerator-runtime");
const nspell = require("nspell");
const StringSource = require("textlint-util-to-string");
const { promisify } = require("util");
const { matchPatterns } = require("@textlint/regexp-string-matcher");

const reporter = (
  { Syntax, RuleError, report, getSource, fixer },
  { language = "en-us", skipPatterns = [] }
) => ({
  async [Syntax.Paragraph](node) {
    const text = getSource(node);
    const source = new StringSource(node);
    const dictionary = require(`dictionary-${language}`);
    const spell = nspell(await promisify(dictionary)());
    const regExp = /[^ ,.?!(){}\[\]"]+/g;
    for (
      let matches = regExp.exec(text);
      matches !== null;
      matches = regExp.exec(text)
    ) {
      const originalIndex = source.originalIndexFromIndex(matches.index);
      const originalRange = [originalIndex, originalIndex + matches[0].length];
      const excludes = matchPatterns(text, skipPatterns);
      const doesContain = exclude =>
        source.originalIndexFromIndex(exclude.startIndex) <= originalRange[0] &&
        originalRange[1] <= source.originalIndexFromIndex(exclude.endIndex);
      if (!excludes.some(doesContain) && !spell.correct(matches[0])) {
        const suggestions = spell.suggest(matches[0]);
        const fix =
          suggestions.length === 1
            ? fixer.replaceTextRange(originalRange, suggestions[0])
            : undefined;
        const message = `${matches[0]} -> ${suggestions.join(", ")}`;
        const ruleError = new RuleError(message, {
          index: originalIndex,
          fix
        });
        report(node, ruleError);
      }
    }
  }
});

module.exports = {
  linter: reporter,
  fixer: reporter
};
