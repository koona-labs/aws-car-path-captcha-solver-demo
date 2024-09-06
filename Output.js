import { Jimp } from 'jimp'
import { cv } from 'opencv-wasm'

export default class Output{

    static matToJimp(image) {

        const width = image.cols
        const height = image.rows

        const channelsCount = image.channels()

        const data = new Uint8Array(4 * width * height)

        for (let k = 0; k < image.data.length/channelsCount; k++) {
            data[4 * k] = image.data[channelsCount * k]
            data[4 * k + 1] = channelsCount >= 2 ? image.data[channelsCount * k + 1] : data[4 * k]
            data[4 * k + 2] = channelsCount >= 3 ? image.data[channelsCount * k + 2] : data[4 * k]
            data[4 * k + 3] = channelsCount >= 4 ? image.data[channelsCount * k + 3] : 255
        }
        
        return new Jimp({
            width,
            height,
            data: Buffer.from(data)
        })
    }

    static async write(mat, name) {
        await Output.matToJimp(mat).write('./output/' + name)
    }
    
    
    static async withLines(original, lines, name) {
        const result = cv.Mat.zeros(original.rows, original.cols, cv.CV_8UC4);
        for(const line of lines) {
            cv.line(result, line.startPoint, line.endPoint, [255, 255, 255, 255], 1);
        }
        await Output.write(result, name)
        result.delete() 
    }

    static async withLabeledLines(original, lines, name) {
        const result = cv.Mat.zeros(original.rows, original.cols, cv.CV_8UC4);
        for(let index = 0; index < lines.length; index++) {
            const line = lines[index]
            cv.line(result, line.startPoint, line.endPoint, [255, 255, 255, 255], 1);
            cv.line(result, line.startPoint, line.endPoint, [255, 255, 255, 255], 1);
            cv.putText(result, `${index + 1}`, line.labelPosition(0.25), cv.FONT_HERSHEY_SIMPLEX, 0.5, [255, 255, 255, 255], 1, cv.LINE_AA, false)
        }
        const endPoint = lines[lines.length - 1].endPoint
        cv.circle(result, endPoint, 8, [255, 255, 255, 255], 1.5)
        await Output.write(result, name)
        result.delete()
    }



}
