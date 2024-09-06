import { Jimp } from 'jimp'
import { cv } from 'opencv-wasm'
import LineSegment from './LineSegment.js'
import LineBundle from './LineBundle.js'
import Output from './Output.js'



const rawImage = await Jimp.read('captcha.png')
const original = cv.matFromImageData(rawImage.bitmap)


//step 1
const isolated  = new cv.Mat()
new cv.cvtColor(original,isolated,cv.COLOR_RGBA2GRAY);
for (let k = 0; k < original.data.length / 4; k++) {
    const colors = original.data.slice(k * 4, k * 4 +3)
    const avg = colors.reduce((acc,curr) => acc + curr/colors.length,0)
    const variance = colors.reduce((acc,curr) => acc + (curr-avg)**2,0)
    if (variance >= 8000) {
        isolated.data[k] = 255
    } else {
        isolated.data[k] = 0
    }
}



//step 2
const carStartImage = await Jimp.read('car_start.png')
const carStart = cv.matFromImageData(carStartImage.bitmap)
cv.cvtColor(carStart, carStart, cv.COLOR_RGBA2GRAY, 0)
const difference = new cv.Mat()
cv.matchTemplate(isolated, carStart, difference, cv.TM_CCOEFF);
const maxLoc = cv.minMaxLoc(difference);
const topLeft = maxLoc.maxLoc;
const bottomRight = new cv.Point(topLeft.x + carStart.cols, topLeft.y + carStart.rows);
const startPoint =  new cv.Point((topLeft.x + bottomRight.x) / 2, (topLeft.y + bottomRight.y) / 2)
const isolatedWithoutCar = isolated.clone()
cv.rectangle(isolatedWithoutCar, topLeft, bottomRight, [0, 0, 0, 255], -1, cv.LINE_8, 0);


//step 3
const lines = new cv.Mat();
cv.HoughLinesP(isolatedWithoutCar, lines, 0.5, Math.PI / 720, 15, 15, 5);


const lineSegments = []
for (let i = 0; i < lines.rows; ++i) {
    const coordinates = lines.intPtr(i)
    const startPoint = new cv.Point(...coordinates.slice(0,2))
    const endPoint = new cv.Point(...coordinates.slice(2,4))
    lineSegments.push(new LineSegment(startPoint, endPoint))
}

// step 4
const lineBundles = []
for (const currentSegment of lineSegments) {
    let isNewBundle = true
    for (const bundle of lineBundles) {
        if (bundle.angularDistance(currentSegment) < 20 && bundle.distance(currentSegment) < 15) {
            bundle.push(currentSegment)
            isNewBundle = false
            break
        }
    }
    if (isNewBundle) {
        lineBundles.push(new LineBundle(currentSegment))
    }
}

const pathSegments = lineBundles.map(bundle => bundle.rep)

const orderedPath = []
let start = startPoint
while (pathSegments.length > 0) {
    const distances = pathSegments.map(line => line.distanceToEdge(start))
    const min = Math.min(...distances)
    const index = distances.indexOf(min)
    const segment = pathSegments[index]
    const orientedSegment = segment.shouldBeFlipped(start) ? segment.flip() : segment
    orderedPath.push(orientedSegment)
    pathSegments.splice(index, 1)
    start = orientedSegment.endPoint
}


const solution = orderedPath[orderedPath.length - 1].endPoint
console.log('The solution is',solution)

await Output.write(original,'original.png')
await Output.write(isolated,'isolated.png')
await Output.write(isolatedWithoutCar,'isolated_without_car.png')
await Output.withLines(isolatedWithoutCar,lineSegments,'all_lines.png')
await Output.withLines(isolatedWithoutCar,lineBundles.map(bundle => bundle.rep),'path.png')
await Output.withLabeledLines(isolatedWithoutCar,orderedPath,'labeled_path.png')






