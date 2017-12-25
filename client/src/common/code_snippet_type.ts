export const CodeSnippetType = {
    c: { name: 'C (LibCurl)', types: ['libcurl'] },
    clojure: { name: 'Clojure (CljHttp)', types: ['clj-http'] },
    'c#': { name: 'C# (RestSharp)', types: ['restsharp'] },
    go: { name: 'Go', types: ['native'] },
    java: { name: 'Java', types: ['okhttp', 'unirest'] },
    javascript: { name: 'Javascript', types: ['jquery', 'xhr'] },
    node: { name: 'Node', types: ['native', 'request', 'unirest'] },
    objc: { name: 'Objective-C (NSURL)', types: ['nsurlsession'] },
    ocaml: { name: 'OCaml (Cohttp)', types: ['cohttp'] },
    php: { name: 'PHP', types: ['curl', 'http1', 'http2'] },
    python: { name: 'Python', types: ['request', 'python3'] },
    ruby: { name: 'Ruby', types: ['native'] },
    shell: { name: 'Shell', types: ['curl', 'httpie', 'wget'] },
    swift: { name: 'Swift (NSURL)', types: ['nsurlsession'] }
};

export type CodeSnippetLang = 'c' | 'clojure' | 'c#' | 'go' | 'java' | 'javascript' | 'node' | 'objc' | 'ocaml' | 'php' | 'python' | 'ruby' | 'shell' | 'swift';