import { cv } from 'opencv-wasm';

export default class LineSegment {

    constructor(startPoint, endPoint) {
        this.startPoint = startPoint;
        this.endPoint = endPoint;
        this.length = Math.hypot(endPoint.x - startPoint.x, endPoint.y - startPoint.y);
        this.angle = Math.atan2(endPoint.y - startPoint.y, endPoint.x - startPoint.x) * 180 / Math.PI;
    }

    static distance(pointA, pointB) {
        return Math.hypot(pointA.x - pointB.x, pointA.y - pointB.y)
    }

    distanceToLineSegment(segment) {
        const r1x = this.endPoint.x - this.startPoint.x
        const r1y = this.endPoint.y - this.startPoint.y
        const r2x = segment.endPoint.x - segment.startPoint.x
        const r2y = segment.endPoint.y - segment.startPoint.y
        const determinant = -r2x * r1y + r1x * r2y

        const diff_x = this.startPoint.x - segment.startPoint.x
        const diff_y = this.startPoint.y - segment.startPoint.y
        if (determinant === 0) {
            return this.distanceToPoint(segment.startPoint)
        }
        const x = 1 / determinant * (-r1y * diff_x + r1x * diff_y) * determinant
        const y = 1 / determinant * (-r2y * diff_x + r2x * diff_y) * determinant
        if (Math.min(x, y) >= 0 && Math.max(x, y) <= 1) {
            return 0
        }
        return Math.min(
            this.distanceToPoint(segment.startPoint),
            this.distanceToPoint(segment.endPoint),
            segment.distanceToPoint(this.startPoint),
            segment.distanceToPoint(this.endPoint)
        )
    }

    distanceToPoint(point) {
        const direction = new cv.Point(this.endPoint.x - this.startPoint.x, this.endPoint.y - this.startPoint.y)
        const connection = new cv.Point(point.x - this.startPoint.x, point.y - this.startPoint.y)
        let factor = (connection.x * direction.x + connection.y * direction.y) / (direction.x * direction.x + direction.y * direction.y)
        factor = Math.max(0, Math.min(1, factor))
        const targetPoint = new cv.Point(this.startPoint.x + factor * direction.x, this.startPoint.y + factor * direction.y)
        return LineSegment.distance(targetPoint, point)
    }

    distanceToEdge(point) {
        return Math.min(LineSegment.distance(point, this.startPoint), LineSegment.distance(point, this.endPoint))
    }

    shouldBeFlipped(point) {
        return LineSegment.distance(point, this.startPoint) > LineSegment.distance(point, this.endPoint)
    }

    flip() {
        return new LineSegment(this.endPoint, this.startPoint)
    }

    labelPosition(weight) {
        return new cv.Point((1 - weight) * this.startPoint.x + weight * this.endPoint.x, (1 - weight) * this.startPoint.y + weight * this.endPoint.y)
    }

}
