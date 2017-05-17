import { Modal } from 'antd';

export function deleteDlg(type: string, onOk: (func: Function) => any) {
    Modal.confirm({
        title: `Delete ${type}`,
        content: `You want to delete this ${type}, right?`,
        okText: 'Yes',
        cancelText: 'No',
        onOk: onOk,
    });
}