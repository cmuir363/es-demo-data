
//produce hourly indices

export const produceHourlyIndexName = (indexName: string) => {
    const dateTime = new Date().toISOString()
    const hourlyIndex = isoDayAndHourOnly(dateTime)
    return indexName + "-" + hourlyIndex
}

const isoDayAndHourOnly = (isoDate: string) =>  {
    const isoDayAndHourOnly = isoDate.substring(0, 13)
    //as index names must be lwoer case we need to strip the capital T
    return isoDayAndHourOnly.replace("T", "-")
}
