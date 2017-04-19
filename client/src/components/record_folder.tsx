import React from 'react';
import { DtoResRecord } from "../../../api/interfaces/dto_res";

interface IRecordFolderProps extends DtoResRecord { }

interface IRecordFolderState { }

class RecordFolder extends React.Component<IRecordFolderProps, IRecordFolderState> {
    public render() {
        return (
            <span>Body</span>
        );
    }
}

export default RecordFolder;