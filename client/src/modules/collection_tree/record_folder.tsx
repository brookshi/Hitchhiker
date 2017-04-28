import React from 'react';
import { Icon } from 'antd';
import './style/index.less';

interface RecordFolderProps {
    name: string;
    isOpen: boolean;
}

interface RecordFolderState { }

class RecordFolder extends React.Component<RecordFolderProps, RecordFolderState> {

    public render() {
        let { name, isOpen } = this.props;

        return (
            <span>
                <Icon className="c-icon" type={isOpen ? 'folder-open' : 'folder'} />
                <span>
                    {name}
                </span>
            </span>
        );
    }
}

export default RecordFolder;