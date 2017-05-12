import React from 'react';
import AceEditor from 'react-ace';

import 'brace/mode/javascript';
import 'brace/mode/json';
import 'brace/theme/xcode';
import 'brace/ext/language_tools';
import 'brace/snippets/javascript';

import './style/index.less';

interface EditorProps {
    type?: 'javascript' | 'xml' | 'json' | 'text';
    value?: string;
    readOnly?: boolean;
    height?: number;
    onChange?: (value: string) => void;
}

interface EditorState { }

const markers = [];
//     startRow: 0,
//     startCol: 1,
//     endRow: 0,
//     endCol: Infinity,
//     type: "screenLine",
//     className: "ace_active-line"
// }];

class Editor extends React.Component<EditorProps, EditorState> {

    public render() {
        const { type, value, height, readOnly, onChange } = this.props;
        const activeHeight = height || 500;
        const maxLines = activeHeight / 15;

        let props = {
            className: 'req-editor',
            mode: type,
            theme: 'xcode',
            width: '100%',
            height: activeHeight + 'px',
            maxLines: maxLines,
            minLines: maxLines,
            fontSize: 12,
            showGutter: true,
            showPrintMargin: false,
            wrapEnabled: true,
            value: value,
            readOnly: readOnly,
            onChange: onChange,
            markers: markers
        };
        if (type === 'javascript') {
            props = {
                ...props,
                enableBasicAutocompletion: true,
                enableLiveAutocompletion: true,
                setOptions: { enableSnippets: true }
            };
        }

        return (
            <AceEditor {...props} />
        );
    }
}

export default Editor;