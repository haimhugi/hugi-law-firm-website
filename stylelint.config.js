export default {
  extends: ['stylelint-config-standard'],
  rules: {
    // The site's palette and type scale are written as hex and raw families on purpose.
    'color-function-notation': null,
    'alpha-value-notation': null,
    'color-function-alias-notation': null,
    'font-family-name-quotes': null,
    'hue-degree-notation': null,
    'import-notation': 'string',
    'media-feature-range-notation': null,
    // Ids are the DOM contract shared with the scripts and the tests.
    'selector-id-pattern': null,
    // Source order is the cascade. A later, less specific rule is sometimes intentional.
    'no-descending-specificity': null,
  },
};
