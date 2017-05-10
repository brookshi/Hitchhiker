export class Beautify {

    static xml(text: string): string {
        const proper = false;
        const improper = !proper;

        const ar = text.replace(/>\s{0,}<([^\/])/g, '><$1').replace(/>\n</g, '><') // Fix for GH#1610
            .replace(/</g, '~::~<')
            /*.replace(/\s*xmlns\:/g,"~::~xmlns:")
            .replace(/\s*xmlns\=/g,"~::~xmlns=")*/
            .split('~::~');
        let len = ar.length;
        let inComment = false;
        let deep = 0;
        let str = '';
        let ix = 0;
        let shift = Beautify.createShiftArr();

        for (ix = 0; ix < len; ix++) {
            // start comment or <![CDATA[...]]> or <!DOCTYPE //
            if (ar[ix].search(/<!/) > -1) {
                str += shift[deep] + ar[ix];
                inComment = true;
                // end comment  or <![CDATA[...]]> //
                if (ar[ix].search(/-->/) > -1 || ar[ix].search(/\]>/) > -1 || ar[ix].search(/!DOCTYPE/) > -1) {
                    inComment = false;
                }
            } else {
                // end comment  or <![CDATA[...]]> //
                if (ar[ix].search(/-->/) > -1 || ar[ix].search(/\]>/) > -1) {
                    str += ar[ix];
                    inComment = false;
                } else {
                    // <elm></elm> //
                    const r1 = /^<[\w:\-\.\,]+/.exec(ar[ix - 1]);
                    const r2 = /^<\/[\w:\-\.\,]+/.exec(ar[ix]);
                    if (/^<\w/.exec(ar[ix - 1]) &&
                        /^<\/\w/.exec(ar[ix]) &&
                        r1 != null &&
                        r2 != null &&
                        r1[0] === r2[0].replace('/', '')) {
                        str += ar[ix].trim(); // if the closing tag token has spaces or newlines after it, trim
                        if (!inComment && !(Beautify.isSingleTag(ar[ix]) && improper)) {
                            deep--;
                        }
                    } else {
                        // <elm> //
                        if (ar[ix].search(/<\w/) > -1 && ar[ix].search(/<\//) === -1 && ar[ix].search(/\/>/) === -1) {
                            if (Beautify.isSingleTag(ar[ix]) && improper) {
                                str = !inComment ? str += shift[deep] + ar[ix] : str += ar[ix];
                            } else {
                                str = !inComment ? str += shift[deep++] + ar[ix] : str += ar[ix];
                            }
                        } else {
                            // <elm>...</elm> //
                            if (ar[ix].search(/<\w/) > -1 && ar[ix].search(/<\//) > -1) {
                                str = !inComment ? str += shift[deep] + ar[ix] : str += ar[ix];
                            } else {
                                // </elm> //
                                if (ar[ix].search(/<\//) > -1) {
                                    if (Beautify.isSingleTag(ar[ix]) && improper) {
                                        str = !inComment ? str += shift[deep] + ar[ix] : str += ar[ix];
                                    } else {
                                        if (deep > 0) {
                                            deep--;
                                        }
                                        str = !inComment ? str += shift[deep] + ar[ix].trim() : str += ar[ix];
                                    }
                                } else {
                                    // <elm/> //
                                    if (ar[ix].search(/\/>/) > -1) {
                                        str = !inComment ? str += shift[deep] + ar[ix].trim() : str += ar[ix];
                                    } else {
                                        // <? xml ... ?> //
                                        if (ar[ix].search(/<\?/) > -1) {
                                            str += shift[deep] + ar[ix];
                                        } else {
                                            // xmlns //
                                            if (ar[ix].search(/xmlns\:/) > -1 || ar[ix].search(/xmlns\=/) > -1) {
                                                str += shift[deep] + ar[ix];
                                            } else {
                                                str += ar[ix];
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }

        return (str[0] === '\n') ? str.slice(1) : str;
    }

    static json(text: string): string {

        let step = 4;
        let arrBody = Array<string>(),
            arrNums = Array<string>(),
            str = '',
            delimiter = '1.234567890098765',
            ix;

        if (typeof JSON === 'undefined') { return text; }
        if (typeof text === 'object') { return JSON.stringify(text, null, step); }

        if (typeof text === 'string') {

            // save original invalid numbers in array and replace them //
            // with valid delimiter to let JSON to process the string //
            text = text.replace(/[0-9]{17,32}/g, (match) => {
                arrNums.push(match);
                return delimiter;
            });

            // beautify json string with delimiters instead of original numbers //
            text = JSON.stringify(JSON.parse(text), null, step);

            // split the string into array//
            arrBody = text.split(delimiter.toString());

            // restore original numbers//
            for (ix = 0; ix < arrNums.length; ix++) {
                str += arrBody[ix] + arrNums[ix];
            }

            return str + arrBody[ix];
        }

        return text;
    }

    private static createShiftArr() {
        const space = '    ';
        let shift = ['\n']; // array of shifts
        for (let ix = 0; ix < 100; ix++) {
            shift.push(shift[ix] + space);
        }
        return shift;
    }

    private static isSingleTag(term: string): boolean {
        var singleTags = /<\/{0,1}(hr|link|br|meta|param|input|img|col|area|base|embed)(\s|\>|\/)/gi;
        if (term.match(singleTags)) {
            return true;
        }
        return false;
    }
}