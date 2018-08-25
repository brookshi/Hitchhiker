import React from 'react';
import hljs from 'highlight.js/lib/highlight';
import 'highlight.js/styles/tomorrow.css';

interface HighlightCodeProps {

    code: string;
}

interface HighlightCodeState { }

class HighlightCode extends React.Component<HighlightCodeProps, HighlightCodeState> {

    pre;

    public componentDidMount() {
        hljs.registerLanguage('javascript', require('highlight.js/lib/languages/javascript'));
        hljs.registerLanguage('json', require('highlight.js/lib/languages/json'));
        hljs.registerLanguage('xml', require('highlight.js/lib/languages/xml'));
        hljs.highlightBlock(this.pre);
    }

    public componentDidUpdate(_prevProps: HighlightCodeProps, _prevState: HighlightCodeState) {
        hljs.highlightBlock(this.pre);
    }

    public render() {
        return (
            <pre ref={e => this.pre = e} style={{ background: 'transparent' }}><code>{this.props.code}</code></pre>
        );
    }
}

export default HighlightCode;