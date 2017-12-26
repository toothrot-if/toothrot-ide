
var LANGUAGE_ID = "toothrot";

var TOKEN_STORY_TITLE = "story-title";
var TOKEN_SECTION_TITLE = "story-title";
var TOKEN_NODE_TITLE = "identifier.title";
var TOKEN_LINE_OPERATOR = "operators.line";
var TOKEN_RETURN = "operators.line";
var TOKEN_PROPERTY_NAME = "identifier.property";
var TOKEN_PROPERTY_VALUE = "string";
var TOKEN_TAG = "identifier.tags";
var TOKEN_LINK = "token-link";
var TOKEN_FLAG = "token-flag";
var TOKEN_NODE_NAME = "identifier.node";
var TOKEN_SCRIPT_NAME = "identifier.script";
var TOKEN_COMMENT = "comment.line";

var THEME = {
    base: "vs-dark",
    inherit: true,
    rules: [
        {token: TOKEN_RETURN, foreground: "808080"},
        {token: TOKEN_LINK, foreground: "FFA500"},
        {token: TOKEN_FLAG, foreground: "008B8B"},
        {token: TOKEN_STORY_TITLE, foreground: "FFA500", fontStyle: "bold underline"},
        {token: "comment.line", foreground: "505050", fontStyle: "italic"},
        {token: "operators.line", foreground: "BA55D3", fontStyle: "bold"},
        {token: "identifier.node", foreground: "569CD6", fontStyle: "bold"},
        {token: "identifier.title", foreground: "569CD6", fontStyle: "bold underline"},
        {token: "identifier.tags", foreground: "FFD700", fontStyle: "italic"},
        {token: "identifier.property", foreground: "808080", fontStyle: "italic"},
        {token: "identifier.script", foreground: "00FA9A", fontStyle: "bold"}
    ]
};

var TOKEN_DEFINITONS = {
    
    defaultToken: "",
    
    tokenizer: {
        root: [
            // Story title
            [/^#[^#]+/, TOKEN_STORY_TITLE],
            
            // Section title
            [/##\s*[^#]+/, TOKEN_SECTION_TITLE],
            
            // Text node title
            [/###[^#]+/, TOKEN_NODE_TITLE],
            
            // Comment
            [/^\(-\).*/, TOKEN_COMMENT],
            
            // Return marker
            [/(\(<\))(\s*)(.*)/, [TOKEN_RETURN, "white", TOKEN_TAG]],
            
            // Next marker
            [/(\(>\))(\s*)(.*)/, [TOKEN_LINE_OPERATOR, "white", TOKEN_NODE_NAME]],
            
            // Flags
            [/^(\(#\))(\s*)(flags:)(.*)/, [TOKEN_LINE_OPERATOR, "white", TOKEN_FLAG, "string"]],
            
            // Tags
            [/^(\(#\))(\s*)(tags:)(.*)/, [TOKEN_LINE_OPERATOR, "white", TOKEN_TAG, "string"]],
            
            // Contains property
            [
                /^(\(#\))(\s*)(contains:)(.*)/,
                [TOKEN_LINE_OPERATOR, "white", TOKEN_NODE_NAME, "string"]
            ],
            
            // Property
            [
                /(\(#\))(\s+)([a-zA-Z0-9_-]+:)(\s*)(.*)/,
                [TOKEN_LINE_OPERATOR, "white", TOKEN_PROPERTY_NAME, "white", TOKEN_PROPERTY_VALUE]
            ],
            
            // Option
            [
                /^(\(@\))(\s*)([^\s]+)(\s*)(\?\?\?)(\s+)([^=]+)(=>)(\s*)([^|]*)/,
                [
                    TOKEN_LINE_OPERATOR,
                    "white",
                    TOKEN_FLAG,
                    "white",
                    TOKEN_LINE_OPERATOR,
                    "white",
                    "white",
                    TOKEN_LINE_OPERATOR,
                    "white",
                    TOKEN_NODE_NAME
                ]
            ],
            [
                /^(\(@\))(\s+)([^=]+)(=>)(\s+)([^|]+)/,
                [
                    TOKEN_LINE_OPERATOR,
                    "white",
                    "white",
                    TOKEN_LINE_OPERATOR,
                    "white",
                    TOKEN_NODE_NAME
                ]
            ],
            [
                /(\|)(\s+)(.*)/,
                [
                    TOKEN_LINE_OPERATOR,
                    "white",
                    "string"
                ]
            ],
            
            // Anonymous node operator
            [/^\*\*\*/, TOKEN_LINE_OPERATOR],
            
            // Slot
            [/`(@[a-zA-Z0-9_]+)`/, TOKEN_SCRIPT_NAME],
            
            // Link
            [/(\[[^\]]+\]\()(#[^)]+)(\))/, [TOKEN_LINK, TOKEN_NODE_NAME, TOKEN_LINK]],
            
            // Scripts
            [
                /^```[^`]+/,
                {
                    token: TOKEN_SCRIPT_NAME,
                    bracket: "@open",
                    next: "script",
                    nextEmbedded: "text/javascript"
                }
            ],
            [/^```/, {token: TOKEN_SCRIPT_NAME, bracket: "@close"}]
            
        ],
        
        script: [
            [/^```([^`]+)(@[a-zA-Z0-9_]+)/, ["white", TOKEN_SCRIPT_NAME]],
            [/^```/, {token: "@rematch", next: "@pop", nextEmbedded: "@pop"}]
        ]
    }
};

function register(monaco) {
    monaco.languages.register({id: LANGUAGE_ID});
    monaco.languages.setMonarchTokensProvider(LANGUAGE_ID, TOKEN_DEFINITONS);
    monaco.editor.defineTheme(LANGUAGE_ID, THEME);
}

module.exports = {
    register: register
};
