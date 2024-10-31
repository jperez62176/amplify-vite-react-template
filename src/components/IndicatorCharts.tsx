import { useEffect, useState } from 'react';
import Plot from 'react-plotly.js';

class Dataset {
    date: Date[]
    price: number[];

    constructor(date: Date[] = [], price: number[] = []) {
        this.date = date
        this.price = price
    }
}

interface ChartingProps {
    datasets: Dataset[]
}

function ChartIndicators({datasets}: ChartingProps) {
    console.log("this is the dataset of indicators: " + JSON.stringify(datasets))
    const [indicatorCharts, setIndicatorCharts] = useState<JSX.Element[]>([<p key={"faded"}>Pushing P</p>])

    useEffect(() => { 
        if (datasets && datasets.length > 0){
            console.log("this is only ran once, dataset length: " + datasets.length)
            const chartTags = datasets.map((data: Dataset, index: number) => (
                <Plot
                    key={index}
                    data={[
                        {
                            x: data.date,
                            y: data.price,
                            type: "scatter",
                            mode: 'lines+markers',
                            marker: {color: "Red"}
                        }
                    ]}
                    layout={{width: window.innerWidth * 0.8, height: window.innerHeight * 0.5}}
                    style={{margin: "0", width: "100%"}}
                />
            ))
            if (chartTags){
                setIndicatorCharts(chartTags)
            }
        }    
    }, [datasets.length])
    return (
        <>
            {indicatorCharts}
        </>
    )
}

export default ChartIndicators