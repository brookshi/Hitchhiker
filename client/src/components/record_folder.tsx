import React from 'react';
import { Record } from '../../../api/models/record';

interface IRecordFolderProps extends Record { }

interface IRecordFolderState { }

class RecordFolder extends React.Component<IRecordFolderProps, IRecordFolderState> {
    public render() {
        return (
            <span>Body</span>
        );
    }
}

export default RecordFolder;