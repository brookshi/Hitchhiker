export class TemplateUtil {

    private static prepareContent(content: string) {
        return content.replace(/\n/g, '').replace(/\t/g, '');
    }

    private static prepareRows() {
        let rows = new Array<string>();
        rows.push('let arr = [];');
        return rows;
    }

    private static parseHtml(rows: string[], row: string) {
        rows.push(`arr.push('${row.replace(/('|")/g, '\\$1')}');`);
    }

    private static parseVariable(rows: string[], row: string) {
        rows.push(`arr.push(${row});`);
    }

    private static parseBranch(rows: string[], row: string) {
        rows.push(row);
    }

    static apply(content: string, data: any) {
        content = this.prepareContent(content);
        let currentIndex = 0;
        let rows = this.prepareRows();
        let match: RegExpExecArray | null;
        let syntaxRegex = /{{(.+?)}}/g;

        while ((match = syntaxRegex.exec(content)) !== null) {

            let pre = content.substr(currentIndex, match.index - currentIndex);
            this.parseHtml(rows, pre);
            let branchRegex = /^\s?(do|for|if|else|while|{|}).*?/g;

            if (branchRegex.test(match[1])) {
                this.parseBranch(rows, match[1]);
            } else {
                this.parseVariable(rows, match[1]);
            }
            currentIndex = match.index + match[0].length;
        }
        this.parseHtml(rows, content.substr(currentIndex));

        rows.push('return arr.join("");');

        return new Function(rows.join('')).apply(data);
    }
}