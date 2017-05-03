import React from 'react';
import AceEditor from 'react-ace';

import 'brace/mode/javascript';
import 'brace/mode/json';
import 'brace/theme/xcode';
import 'brace/ext/language_tools';
import 'brace/snippets/javascript';

import './style/index.less';

interface EditorProps {
    type?: 'javascript' | 'xml' | 'json' | '';
}

interface EditorState { }

class Editor extends React.Component<EditorProps, EditorState> {
    public render() {
        const { type } = this.props;
        let props = {
            className: "req-editor",
            mode: type,
            theme: "xcode",
            highlightActiveLine: true,
            height: "300px",
            width: "100%",
            fontSize: 12,
            showGutter: true,
            showPrintMargin: false
        };
        if (type === 'javascript') {
            props = {
                ...props,
                enableBasicAutocompletion: true,
                enableLiveAutocompletion: true,
                setOptions: { enableSnippets: true }
            }
        }

        return (
            <AceEditor {...props} />
        );
    }
}

export default Editor;