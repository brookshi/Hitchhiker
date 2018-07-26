import React from 'react';
import { SortableContainer, SortableElement, SortableHandle, arrayMove } from 'react-sortable-hoc';
import { Input, Checkbox, Icon, AutoComplete, Button } from 'antd';
import './style/index.less';
import { StringUtil } from '../../utils/string_util';
import { DtoHeader } from '../../../../api/src/interfaces/dto_header';
import { headerKeys, headerValues } from '../../common/constants';
import Msg from '../../locales';

const Option = AutoComplete.Option;
const OptGroup = AutoComplete.OptGroup;

const generateDefaultHeader: () => DtoHeader = () => ({

    id: StringUtil.generateUID(),

    isActive: true,

    isFav: false
});

interface KeyValueListComponentProps {

    headers: Array<DtoHeader>;

    onChanged: (headers: DtoHeader[]) => void;

    disableActive?: boolean;

    isAutoComplete?: boolean;

    showFav?: boolean;

    showDescription?: boolean;

    favHeaders?: DtoHeader[];
}

interface KeyValueListComponentState {

    headers: Array<DtoHeader>;
}

interface SortableElementParam {

    header: DtoHeader;

    hIndex: number;
}

type InputType = 'key' | 'value' | 'description' | 'isActive' | 'isFav';

class KeyValueListComponent extends React.Component<KeyValueListComponentProps, KeyValueListComponentState> {

    get keyDataSource() {
        const favHeaders = this.props.favHeaders;
        return (favHeaders && favHeaders.length > 0 ? [{
            key: 'Favorites',
            title: Msg('Component.Favorites'),
            children: favHeaders.map(h => `${h.key || ''}::${h.value || ''}`)
        }] : []).concat([{
            key: 'Common',
            title: Msg('Component.Common'),
            children: headerKeys
        }]);
    }

    get keyOptions() {
        return this.keyDataSource.map(group => (
            <OptGroup
                key={group.key}
                label={group.title}
            >
                {group.children.map((opt, index) => (
                    <Option key={`${opt}${index}`} value={opt}>
                        {opt}
                    </Option>
                ))}
            </OptGroup>
        ));
    }

    private DragHandle = SortableHandle(() => <span className="keyvalue-dragicon">☰</span>);

    private SortableItem = SortableElement(({ hIndex, header }: SortableElementParam) => {
        const canCheck = hIndex !== this.state.headers.length - 1;
        const favStyle = { color: `${header.isFav ? '#f1d500' : '#000'}`, paddingLeft: 4, paddingRight: 8 };
        return (
            <li className="keyvalue-item">
                {
                    canCheck ? (
                        <div>
                            <this.DragHandle />
                            <Checkbox
                                key={`cb${header.id}`}
                                style={this.props.disableActive ? { display: 'none', marginRight: 4 } : { marginRight: 4 }}
                                onChange={(e) => this.onValueChange('isActive', hIndex, e)}
                                defaultChecked={header.isActive}
                            />
                            {
                                this.props.showFav ?
                                    <Button className="keyvalue-item-fav-btn" style={favStyle} icon={header.isFav ? 'star' : 'star-o'} onClick={() => this.onValueChange('isFav', hIndex, !header.isFav)} />
                                    : ''
                            }
                        </div>
                    ) : null
                }

                {this.generateInputControl(true, hIndex, header.key)}
                {this.generateInputControl(false, hIndex, header.value)}
                {this.props.showDescription ? this.getInput('description', hIndex, header.description) : ''}

                {canCheck ? <Icon type="close" onClick={() => this.onDelItem(hIndex)} /> : null}
            </li>
        );
    });

    private generateInputControl = (isKey: boolean, hIndex: number, value?: string) => {
        const type = isKey ? 'key' : 'value';
        return this.props.isAutoComplete ? (
            <AutoComplete
                className={this.inputClass}
                optionLabelProp="value"
                dataSource={isKey ? [] : headerValues}
                placeholder={type}
                onChange={(e) => this.onValueChange(type, hIndex, e)}
                value={value}
                filterOption={(inputValue, option) => (option as any).props.children.toUpperCase().indexOf(inputValue.toUpperCase()) !== -1}
            >
                {isKey ? this.keyOptions : []}
            </AutoComplete>
        ) : this.getInput(type, hIndex, value);
    }

    private getInput = (type: InputType, hIndex: number, value?: string) => {
        return (
            <Input
                className={this.inputClass}
                spellCheck={false}
                onChange={(e) => this.onValueChange(type, hIndex, e)}
                placeholder={type}
                value={value}
            />
        );
    }

    private get inputClass() {
        return this.props.showDescription ? (this.props.showFav ? 'inputWithFav' : 'inputWithoutFav') : 'inputWithoutFavAndDescription';
    }

    private SortableList = SortableContainer(({ headers }) => {
        return (
            <ul>
                {
                    headers.map((header, index) => (
                        <this.SortableItem
                            key={`item_${index}`}
                            index={index}
                            hIndex={index}
                            header={header}
                            disabled={index === this.state.headers.length - 1}
                        />)
                    )
                }
            </ul>
        );
    });

    constructor(props: KeyValueListComponentProps) {
        super(props);
        this.state = { headers: [generateDefaultHeader()] };
    }

    componentWillMount() {
        this.appendIfNeed(this.props);
    }

    componentWillReceiveProps(nextProps: KeyValueListComponentProps) {
        this.appendIfNeed(nextProps);
    }

    private getInitialHeaders(props: KeyValueListComponentProps): DtoHeader[] {
        let headers = [...props.headers];
        if (!headers || headers.length === 0) {
            headers = [generateDefaultHeader()];
        }
        return headers;
    }

    private appendIfNeed = (props: KeyValueListComponentProps) => {
        const headers = this.getInitialHeaders(props);
        const lastHeader = headers[headers.length - 1];
        if (lastHeader.key || lastHeader.value) {
            headers.push(generateDefaultHeader());
        }
        this.setState({ ...this.state, headers: headers });
    }

    private onSortEnd = ({ oldIndex, newIndex }) => {
        let { headers } = this.state;
        headers = arrayMove(headers, oldIndex, newIndex);
        this.onChanged(headers);
    }

    private onValueChange = (type: InputType, index: number, event) => {
        const { headers } = this.state;
        if (type === 'key' && typeof event === 'string') {
            const values = event.split('::');
            headers[index].key = values[0];
            if (values.length > 1) {
                headers[index].value = values[1];
            }
        } else {
            headers[index][type] = type === 'isActive' ? event.target.checked : (type === 'isFav' ? event : (typeof event === 'string' ? event : event.target.value));
        }
        this.onChanged(headers);
    }

    private onDelItem = (index: number) => {
        const { headers } = this.state;
        headers.splice(index, 1);
        this.onChanged(headers);
    }

    private onChanged(headers: DtoHeader[]) {
        const { onChanged } = this.props;
        if (onChanged) {
            onChanged(headers);
        }
    }

    public render() {
        const headers = this.state.headers;
        return (
            <this.SortableList className="sortable-list" headers={headers} onSortEnd={this.onSortEnd} useDragHandle={true} />
        );
    }
}

export default KeyValueListComponent;