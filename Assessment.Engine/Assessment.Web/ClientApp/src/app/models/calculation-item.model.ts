export class CalculationItem {

    constructor(expression?: string, result?: string) {
        this.expression = expression;
        this.result = result;
    }

    public expression: string;
    public result: string;
}
