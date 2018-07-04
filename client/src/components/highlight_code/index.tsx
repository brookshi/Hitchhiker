import React from 'react';
import hljs from 'highlight.js/lib/highlight';
import 'highlight.js/styles/tomorrow.css';

interface HighlightCodeProps {

    code: string;
}

interface HighlightCodeState { }

const languages = ['javascript', 'json', 'xml'];

class HighlightCode extends React.Component<HighlightCodeProps, HighlightCodeState> {

    pre;

    public componentDidMount() {
        languages.forEach(l => hljs.registerLanguage(l, require('highlight.js/lib/languages/' + l)));
        hljs.highlightBlock(this.pre);
    }

    public componentDidUpdate(prevProps: HighlightCodeProps, prevState: HighlightCodeState) {
        hljs.highlightBlock(this.pre);
    }

    public render() {
        return (
            <pre ref={e => this.pre = e} style={{ background: 'transparent' }}><code>{this.props.code}</code></pre>
        );
    }
}

export default HighlightCode;