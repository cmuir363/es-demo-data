export interface IotData {
    timestamp: number;
    voltage: number;
    temperature: number;
    node: "a" | "b" | "c";
}

/**
 * Log into the system.
 * 
 * @param timeIntervals - The time interval in ms between producing each datapoint
 * @param callback - Function to run each time a data point is produced
 * 
 */
export const produceIotDataStream = (timeIntervals: number, callback: (data) => void): void => {
        setInterval(() => {

            const iotData: IotData = {
                timestamp: new Date().getTime(),
                voltage: getVoltage(3, 10),
                temperature: getTemperature(80, 100),
                node: getNode()
            }
            callback(iotData)
        }, timeIntervals)
}

function getVoltage(min, max) {
    return Math.floor(Math.random() * (max - min) ) + min;
}

function getTemperature(min, max) {
    const num: number = Math.floor(Math.random() * (max - min) ) + min + Math.random()
    return num;
}

function getNode() {
    const nonce = Math.random();
    if (nonce < 0.3333) {
        return "a"
    } else if (nonce >= 0.3333 && nonce <= 0.6666) {
        return "b"
    } else {
        return "c"
    }
}