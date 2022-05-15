type ObjType = {
    [index: string]: any
}

export const keywords: ObjType = {
    "select": {
        default: {
            padding: 0
        },
        "pushState": [
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
        "popState": [
            {
                when: "select"
            }
        ],
        "pushState": [
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
        "popState": [
            {
                when: "on"
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
        "popState": [
            {
                when: "between"
            }
        ],
    },
    "group": {
        default: {
            padding: 1,
            lineBreak: true
        },
        "popState": [
            {
                when: "on"
            }
        ],
    },
    "join": {
        default: {
            padding: 7,
            lineBreak: true
        },
        "pushState": [
            {
                state: "join",
                padding: 0
            }
        ],
        "popState": [
            {
                when: "on"
            }
        ],
    },
    "on": {
        default: {
            padding: 1,
            lineBreak: false
        },
        "popState": [
            {
                when: "join"
            }
        ],
        "pushState": [
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
    ";": {},
    "(": {
        default: {
            padding: 1,
        },
        subquery: {
            padding: 0,
            lineBreak: true
        },
        function: {
            padding: 0,
            lineBreak: false
        },
        "pushState": [
            {
                when: "from",
                state: "subquery",
                popedState: true, // discard 처리하고 next_keyword 가 select 인 경우 subquery 처리
                padding: 8
            },
            {
                when: "join",
                state: "subquery",
                padding: 8
            },
            {
                when: "on",
                state: "condition",
                padding: 1
            },
            {
                state: "function",
                padding: 0
            },
        ],
        "popState": [
            {
                when: "from"
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
            lineBreak: false
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
            popedState: true,
            padding: 7,
            lineBreak: true
        },
        "popState": [{}]
    },
    "between": {
        default: {
            padding: 1,
        },
        "pushState": [
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
        "pushState": [
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
        "popState": [
            {
                when: "case"
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
        }
    },
}