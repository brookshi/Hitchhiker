import { Modal } from 'antd';
import { StringUtil } from '../../utils/string_util';

export function confirmDlg(type: string, onOk: (func: Function) => any, action: string = 'delete', target: string = '') {
    Modal.confirm({
        title: `${StringUtil.upperFirstAlphabet(action)} ${type}`,
        content: `You want to ${action} this ${type}${target ? ': ' : ''}${target}, right?`,
        okText: 'Yes',
        cancelText: 'No',
        onOk: onOk,
    });
}