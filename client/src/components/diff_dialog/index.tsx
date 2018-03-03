import React from 'react';
import { Diff2Html } from 'diff2html';
import 'diff2html/dist/diff2html.css';
import { Modal } from 'antd';
import * as JsDiff from 'diff';
import './style/index.less';

interface DiffDialogProps {

    title: string | React.ReactNode;

    isOpen?: boolean;

    originContent: string;

    originTitle: string;

    targetContent: string;

    targetTitle: string;

    onClose();
}

interface DiffDialogState {

}

class DiffDialog extends React.Component<DiffDialogProps, DiffDialogState> {

    public render() {

        const { title, isOpen, onClose, originTitle, targetTitle, originContent, targetContent } = this.props;
        const diffContent = JsDiff.createTwoFilesPatch(originTitle || '', targetTitle || '', originContent || '', targetContent || '', '', '');
        const diffHtml = Diff2Html.getPrettyHtml(diffContent, { inputFormat: 'diff', outputFormat: 'side-by-side', matching: 'lines' });

        return (
            <Modal
                title={title}
                className="diffdlg"
                visible={isOpen}
                closable={true}
                width="100%"
                style={{ padding: 36, height: '100%', top: 0, }}
                onCancel={onClose}
                footer={null}
            >
                <div dangerouslySetInnerHTML={{ __html: diffHtml }} style={{ height: '100%' }} />
            </Modal>
        );
    }
}

export default DiffDialog;