"use strict";
exports.__esModule = true;
exports.keywords = void 0;
exports.keywords = {
    "SELECT": {
        "default": {
            padding: 0
        },
        pushState: {
            state: "select",
            padding: 0
        }
    },
    "FROM": {
        "default": {
            padding: 2,
            lineBreak: true
        },
        popState: {}
    },
    "WHERE": {
        "default": {
            padding: 1,
            lineBreak: true
        }
    },
    "AND": {
        "default": {
            padding: 3,
            lineBreak: true
        }
    },
    "GROUP": {
        "default": {
            padding: 1,
            lineBreak: true
        }
    },
    "JOIN": {
        "default": {
            padding: 2,
            lineBreak: true
        }
    },
    "FULL": {
        "default": {
            padding: 7,
            lineBreak: true
        }
    },
    "RIGHT": {
        "default": {
            padding: 7,
            lineBreak: true
        }
    },
    "LEFT": {
        "default": {
            padding: 7,
            lineBreak: true
        }
    },
    "OUTER": {
        "default": {
            padding: 7,
            lineBreak: true
        }
    },
    "INNER": {
        "default": {
            padding: 7,
            lineBreak: true
        }
    },
    ",": {
        "default": {
            padding: 0
        },
        select: {
            padding: 5,
            lineBreak: true
        }
    },
    "/*": {},
    "*/": {},
    "(": {
        "default": {
            padding: 1
        },
        subquery: {
            padding: 0,
            lineBreak: true
        },
        pushStateBefore: {
            when: "SELECT",
            state: "subquery",
            padding: 7
        },
        pushState: {
            state: "function",
            padding: 0
        }
    },
    ")": {
        "default": {
            padding: 0,
            lineBreak: true
        },
        "function": {
            padding: 0
        },
        popState: {}
    }
};
