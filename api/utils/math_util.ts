export class MathUtil {

    static distribute(total: number, cores: number): number[] {
        const result: number[] = [];
        for (let i = 0; i < cores; i++) {
            var max = parseInt((total * (i + 1) / cores) + '');
            result.push(i === 0 ? max : max - result[i - 1]);
        }
        return result;
    }
}