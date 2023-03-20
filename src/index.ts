import * as dotenv from 'dotenv'
import { Client } from '@elastic/elasticsearch'

import { produceIotDataStream } from "./iot-data"
import { produceHourlyIndexName } from './es-helpers'

dotenv.config()

const esPassword = process.env.ES_PASSWORD

//connect to es

const client = new Client({
    node: "http://34.159.189.197:9200",
    auth: {
        username: "elastic",
        password: esPassword
    }
})

//change iot data to match the es example

const produce = async () => {
    produceIotDataStream(100, (data) => {
        client.index({
            index: produceHourlyIndexName("machine-sensor"),
            document: { ...data }
        })
        .then(result => console.log(result))
        .catch(err => console.log(err))
    })
}

const fetch = async () => {
    const result = await client.search({
        index: "machine-sensor-rollup",//produceHourlyIndexName("machine-sensor"),
        query: {
            match_all: {}
        }
    })
    console.log(result.hits.hits)

}
//fetch()
produce() 

