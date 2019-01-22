module.exports = {
    "env": {
        "es6": true,
        "node": true
    },
    "extends": "eslint:recommended",
    "parserOptions": {
        "ecmaVersion": 2018,
        "sourceType": "module"
    },
    "rules": {
        "no-console": "off",
        "indent": [
            "error",
            "tab"
        ],
        "linebreak-style": [
            "error",
            "windows"
        ],
        "quotes": [
            "error",
            "double"
        ],
        "semi": [
            "error",
            "always"
        ]
    },
    "globals": {
        "allocated_indices": false,
        "create_table_row": false,
        "inform": false,
        "warn": false,
        "is_reachable": false,
        "reboot": false,
        "reset": false,
        "read": false,
        "write": false,
        "dispatch_change_request": false,
        "pause_ms": false
    }
};