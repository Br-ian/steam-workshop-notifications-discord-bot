module.exports = {
    "env": {
        "es2021": true,
        "node": true
    },
    "extends": "eslint:recommended",
    "parser": "@babel/eslint-parser",
    "parserOptions": {
        "babelOptions": {
            "parserOpts": {
                "plugins": ["importAssertions"]
            },
        },
        "requireConfigFile": false,
        "ecmaVersion": "latest",
        "sourceType": "module"
    },
    "plugins": [
        "@babel"
    ],
    "rules": {
    }
}
