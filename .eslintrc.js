module.exports = {
  "root": true,
  "plugins": [
  "eslint-plugin",
  "import",
],
  "extends": [
  "eslint:recommended",
  "plugin:eslint-plugin/recommended",
  "plugin:import/recommended",
],
  "env": {
  "node": true,
    "es6": true,
    "es2017": true,
},
  "parserOptions": {
  "sourceType": "module",
    "ecmaVersion": 2021,
},
  "rules": {
  "array-bracket-spacing": [2, "never"],
    "arrow-body-style": [2, "as-needed"],
    "arrow-parens": [2, "always"],
    "arrow-spacing": [2, { "before": true, "after": true }],
    "block-spacing": [2, "always"],
    "brace-style": [2, "1tbs", { "allowSingleLine": true }],
    "comma-dangle": ["error", {
    "arrays": "always-multiline",
    "objects": "always-multiline",
    "imports": "always-multiline",
    "exports": "always-multiline",
    "functions": "always-multiline",
  }],
    "comma-spacing": [2, { "before": false, "after": true }],
    "comma-style": [2, "last"],
    "computed-property-spacing": [2, "never"],
    "curly": [2, "all"],
    "default-case": [2, { "commentPattern": "(?:)" }],
    "default-case-last": [2],
    "default-param-last": [2],
    "dot-location": [2, "property"],
    "dot-notation": [2, { "allowKeywords": true, "allowPattern": "throws" }],
    "eol-last": [2, "always"],
    "eqeqeq": [2, "allow-null"],
    "for-direction": [2],
    "function-call-argument-newline": [2, "consistent"],
    "func-call-spacing": [2, "never"],
    "implicit-arrow-linebreak": [2, "beside"],
    "indent": [2, 2, {
    "SwitchCase": 1,
    "VariableDeclarator": 1,
    "outerIIFEBody": 1,
    "FunctionDeclaration": {
      "parameters": 1,
      "body": 1
    },
    "FunctionExpression": {
      "parameters": 1,
      "body": 1
    },
    "CallExpression": {
      "arguments": 1
    },
    "ArrayExpression": 1,
    "ObjectExpression": 1,
    "ImportDeclaration": 1,
    "flatTernaryExpressions": false,
  }],
    "jsx-quotes": [2, "prefer-double"],
    "key-spacing": [2, {
    "beforeColon": false,
    "afterColon": true,
    "mode": "strict",
  }],
    "keyword-spacing": ["error", {
    "before": true,
    "after": true,
    "overrides": {
      "return": { "after": true },
      "throw": { "after": true },
      "case": { "after": true }
    }
  }],
    "linebreak-style": [2, "unix"],
    "lines-around-directive": [2, {
    "before": "always",
    "after": "always",
  }],
    "max-len": 0,
    "new-parens": 2,
    "no-array-constructor": 2,
    "no-compare-neg-zero": 2,
    "no-cond-assign": [2, "always"],
    "no-extra-parens": 2,
    "no-multiple-empty-lines": [2, { "max": 1, "maxEOF": 1, "maxBOF": 0 }],
    "no-return-assign": [2, "always"],
    "no-trailing-spaces": 2,
    "no-var": 2,
    "object-curly-spacing": [2, "always"],
    "object-shorthand": ["error", "always", {
    "ignoreConstructors": false,
    "avoidQuotes": false,
    "avoidExplicitReturnArrows": true,
  }],
    "one-var": [2, "never"],
    "operator-linebreak": [2, "none", {
    "overrides": {
      "?": "before",
      ":": "before",
      "&&": "before",
      "||": "before",
    },
  }],
    "prefer-const": 2,
    "prefer-object-spread": 2,
    "prefer-rest-params": 2,
    "prefer-template": 2,
    "quote-props": [2, "as-needed", { "keywords": false }],
    "quotes": [2, "single", {
    "allowTemplateLiterals": true,
    "avoidEscape": true,
  }],
    "rest-spread-spacing": [2, "never"],
    "semi": [2, "always"],
    "semi-spacing": [2, { "before": false, "after": true }],
    "semi-style": [2, "last"],
    "space-before-blocks": [2, { "functions": "always", "keywords": "always", "classes": "always" }],
    "space-before-function-paren": ["error", {
    "anonymous": "always",
    "named": "never",
    "asyncArrow": "always",
  }],
    "space-in-parens": [2, "never"],
    "space-infix-ops": [2],
    "space-unary-ops": [2, { "words": true, "nonwords": false }],
    "switch-colon-spacing": [2, { "after": true, "before": false }],
    "template-curly-spacing": [2, "never"],
    "template-tag-spacing": [2, "never"],
    "unicode-bom": [2, "never"],
    "use-isnan": [2, { "enforceForSwitchCase": true }],
    "valid-typeof": [2],
    "wrap-iife": [2, "outside", { "functionPrototypeMethods": true }],
    "wrap-regex": [2],
    "yield-star-spacing": [2, { "before": false, "after": true }],
    "yoda": [2, "never", { "exceptRange": true, "onlyEquality": false }],

    "eslint-plugin/consistent-output": [
    "error",
    "always",
  ],
    "eslint-plugin/meta-property-ordering": "error",
    "eslint-plugin/no-deprecated-context-methods": "error",
    "eslint-plugin/no-deprecated-report-api": "off",
    "eslint-plugin/prefer-replace-text": "error",
    "eslint-plugin/report-message-format": "error",
    "eslint-plugin/require-meta-docs-description": ["error", { "pattern": "^(Enforce|Ensure|Prefer|Forbid).+\\.$" }],
    "eslint-plugin/require-meta-schema": "error",
    "eslint-plugin/require-meta-type": "error",

    // dog fooding
    "import/no-extraneous-dependencies": ["error", {
    "devDependencies": [
      "tests/**",
      "resolvers/*/test/**",
      "scripts/**"
    ],
    "optionalDependencies": false,
    "peerDependencies": true,
    "bundledDependencies": false,
  }],
    "import/unambiguous": "off",
},

  "settings": {
  "import/resolver": {
    "node": {
      "paths": [
        "src",
      ],
    },
  },
},

  "overrides": [
  {
    "files": "scripts/**",
    "rules": {
      "no-console": "off",
    },
  },
  {
    "files": [
      "resolvers/**",
      "utils/**",
    ],
    "env": {
      "es6": false,
    },
    "parserOptions": {
      "sourceType": "module",
      "ecmaVersion": 2016,
    },
    "rules": {
      "comma-dangle": ["error", {
        "arrays": "always-multiline",
        "objects": "always-multiline",
        "imports": "always-multiline",
        "exports": "always-multiline",
        "functions": "never"
      }],
      "prefer-destructuring": "warn",
      "prefer-object-spread": "off",
      "prefer-rest-params": "off",
      "prefer-spread": "warn",
      "prefer-template": "off",
    }
  },
  {
    "files": [
      "resolvers/webpack/**",
      "utils/**",
    ],
    "rules": {
      "no-console": 1,
    },
  },
  {
    "files": [
      "resolvers/*/test/**/*",
    ],
    "env": {
      "mocha": true,
      "es6": false
    },
  },
  {
    "files": "tests/**",
    "env": {
      "mocha": true,
    },
    "rules": {
      "max-len": 0,
      "import/default": 0,
    },
  },
],
}