export class DownloadUtil {

    static findTableHtml = (id: string) => {
        const tableDiv = document.getElementById(id);
        const defaultTable = '<table />';

        if (!tableDiv) {
            return defaultTable;
        }
        const findTable: (parent: Element) => (Element | undefined) = (parent: Element) => {
            if (parent.tagName.toLowerCase() === 'table') {
                return parent;
            }
            if (!parent.children) {
                return undefined;
            }
            for (let i = 0; i < parent.children.length; i++) {
                const table = findTable(parent.children.item(i));
                if (table) {
                    return table;
                }
            }
            return undefined;
        };
        const table = findTable(tableDiv);
        return table ? table.outerHTML : defaultTable;
    }

    static download = (name: string, content: string, type: string) => {
        const blob = new Blob(['\uFEFF' + content], { type });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.download = name;
        link.href = url;
        link.click();
    }

    static downloadTable = (id: string, name: string) => {
        const content = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40"><head><!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>Worksheet</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]--></head><body>${DownloadUtil.findTableHtml(id)}</body></html>`;
        DownloadUtil.download(`${name}.xls`, content, 'application/vnd.ms-excel;charset=utf-8');
    }

    static downloadCSV = (header: Array<string>, datas: Array<any>, name: string) => {
        const csv = [header, ...datas].map((row, index) => row.map((element) => '\"' + (element || '').replace(/"/g, `""`) + '\"').join(',')).join(`\n`);
        DownloadUtil.download(`${name}.csv`, csv, 'text/csv;charset=utf-8');
    }
}