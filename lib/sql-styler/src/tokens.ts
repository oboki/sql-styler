type ObjType = {
    [index: string]: any
}

export const keywords: ObjType = {
    "select": {
        default: {
            padding: 0
        },
        pushState: [
            {
                state: "select",
                padding: 0
            }
        ]
    },
    "from": {
        default: {
            padding: 2,
            lineBreak: true
        },
        popState: [
            {
                current: "select"
            }
        ],
        pushState: [
            {
                state: "from",
                padding: 0
            }
        ]
    },
    "where": {
        default: {
            padding: 1,
            lineBreak: true
        },
        popState: [
            {
                current: "on"
            }
        ],
    },
    "and": {
        default: {
            padding: 3,
            lineBreak: true
        },
        condition: {
            padding: 1,
            lineBreak: false
        },
        between: {
            popedState: true,
            padding: 1,
            lineBreak: false
        },
        case: {
            padding: 1,
            lineBreak: false
        },
        popState: [
            {
                current: "between"
            }
        ],
    },
    "group": {
        default: {
            padding: 1,
            lineBreak: true
        },
        popState: [
            {
                current: "on"
            }
        ],
    },
    "join": {
        default: {
            padding: 7,
            lineBreak: true
        },
        pushState: [
            {
                state: "join",
                padding: 0
            }
        ],
        popState: [
            {
                current: "on"
            }
        ],
    },
    "on": {
        default: {
            padding: 1,
            lineBreak: false
        },
        popState: [
            {
                current: "join"
            }
        ],
        pushState: [
            {
                state: "on",
                padding: 0
            }
        ],
    },
    "full": {
        default: {
            padding: 7,
            lineBreak: true
        }
    },
    "right": {
        default: {
            padding: 7,
            lineBreak: true
        }
    },
    "left": {
        default: {
            padding: 7,
            lineBreak: true
        }
    },
    "outer": {
        default: {
            padding: 7,
            lineBreak: true
        }
    },
    "inner": {
        default: {
            padding: 7,
            lineBreak: true
        }
    },
    ",": {
        default: {
            padding: 0,
        },
        select: {
            padding: 5,
            lineBreak: true
        },
    },
    "/*": {},
    "*/": {},
    ";": {
        default: {}
    },
    "(": {
        default: {
            padding: 1,
        },
        function: {
            padding: 0,
            lineBreak: false
        },
        pushState: [
            {
                next: "select",
                state: "subquery",
                padding: 8
            },
            {
                current: "on",
                state: "condition",
                padding: 1
            },
            {
                state: "function",
                padding: 0
            },
        ],
        popState: [
            {
                current: "from"
            }
        ],
    },
    ")": {
        default: {
            padding: 0,
            lineBreak: true
        },
        function: {
            padding: 0,
        },
        on: {
            padding: 0,
            lineBreak: false
        },
        select: {
            padding: 0,
            lineBreak: false
        },
        subquery: {
            padding: 0,
            lineBreak: true
        },
        popState: [{}]
    },
    "between": {
        default: {
            padding: 1,
        },
        pushState: [
            {
                state: "between",
                padding: 0
            }
        ],
    },
    "case": {
        default: {
            padding: 1,
            lineBreak: false
        },
        pushState: [
            {
                state: "case",
                padding: 0
            }
        ],
    },
    "end": {
        default: {
            padding: 0,
            lineBreak: true
        },
        popState: [
            {
                current: "case"
            }
        ],
    },
    "when": {
        default: {
            padding: 1,
            lineBreak: false
        },
        case: {
            padding: 1,
            lineBreak: true
        },
    },
    "default": {
        default: {
            padding: 1,
        },
        join: {
            padding: 7,
            lineBreak: true,
        },
        function: {
            padding: 0,
            lineBreak: false,
        },
        condition: {
            padding: 1,
            lineBreak: false,
        },
        popState: [
            {
                current: "from"
            }
        ]
    },
}