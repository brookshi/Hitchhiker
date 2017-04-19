import React from 'react';
import { DtoRecord } from "../../../api/interfaces/dto_record";

interface IRecordFolderProps extends DtoRecord { }

interface IRecordFolderState { }

class RecordFolder extends React.Component<IRecordFolderProps, IRecordFolderState> {
    public render() {
        return (
            <span>Body</span>
        );
    }
}

export default RecordFolder;