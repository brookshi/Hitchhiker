export class MathUtil {

    static distribute(total: number, cores: number): number[] {
        const result: number[] = [];
        let distributed = 0;
        for (let i = 0; i < cores; i++) {
            const max = parseInt((total * (i + 1) / cores) + '');
            const current = i === 0 ? max : max - distributed;
            distributed += current;
            result.push(current);
        }
        return result;
    }
}