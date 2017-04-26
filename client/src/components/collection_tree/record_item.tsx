import React from 'react';
import HttpMethodIcon from '../font_icon/http_method_icon';
import './style/index.less';

interface RecordItemProps {
    name: string;
    method: string;
    url: string;
}

interface RecordItemState { }

class RecordItem extends React.Component<RecordItemProps, RecordItemState> {
    static defaultHeight: number = 30;

    public render() {
        let { name, method } = this.props;

        return (
            <span>
                <span className="c-icon folder_record">
                    <HttpMethodIcon httpMethod={method.toUpperCase()} />
                </span>
                <span>
                    {name}
                </span>
            </span>
        );
    }
}

export default RecordItem;