export default class LineBundle {

    constructor(line) {
        this.lines = [line];
    }
    push(line) {
        this.lines.push(line)
    }
    get rep() {
        return this.lines.reduce((acc, curr) => curr.length > acc.length ? curr : acc,this.lines[0])
    }
    get angle() {
        return this.lines.map(line => line.angle).reduce((acc, curr) => acc + curr/this.lines.length, 0);
    }
    distance(lineSegment) {
        return lineSegment.distanceToLineSegment(this.rep)
    }
    angularDistance(lineSegment) {
        return Math.abs(this.angle - lineSegment.angle);
    }


}
