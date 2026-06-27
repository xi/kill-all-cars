import { sum } from './utils.js';
import { TERRAIN, DIR, dirToAxis } from './constants.js';

const INTERNAL_SHARE = 0.9;
const ROAD_USAGE_CAR = 1;
const ROAD_USAGE_BIKE = 0.1;

function blockStep(block, params) {
    const demand = block.residential + sum(params.demandFrom.car) + sum(params.demandFrom.bike);
    const servedInternal = Math.min(demand * INTERNAL_SHARE, block.commercial);
    const remainingDemand = demand - servedInternal;

    const carPreference = Math.pow(params.pollution, 0.3);
    const avgRoadUsage = carPreference * ROAD_USAGE_CAR + (1 - carPreference) * ROAD_USAGE_BIKE;

    const flowToTotal = sum(params.flowTo.car) + sum(params.flowTo.bike);
    const totalCapacity = sum(block.roadCapacity);

    const demandTo = {
        car: Object.values(DIR).map(() => 0),
        bike: Object.values(DIR).map(() => 0),
    };

    if (remainingDemand * avgRoadUsage > totalCapacity) {
        for (const dir of Object.values(DIR)) {
            demandTo.car[dir] = block.roadCapacity[dir] / avgRoadUsage * carPreference;
            demandTo.bike[dir] = block.roadCapacity[dir] / avgRoadUsage * (1 - carPreference);
        }
    } else if (flowToTotal > remainingDemand) {
        for (const dir of Object.values(DIR)) {
            demandTo.car[dir] = params.flowTo.car[dir] / flowToTotal * remainingDemand;
            demandTo.bike[dir] = params.flowTo.bike[dir] / flowToTotal * remainingDemand;
        }
    } else {
        const totalUsedCapacity = sum(params.flowTo.car) * ROAD_USAGE_CAR + sum(params.flowTo.bike) * ROAD_USAGE_BIKE;
        const x = (remainingDemand - flowToTotal) / (totalCapacity - totalUsedCapacity);
        for (const dir of Object.values(DIR)) {
            const usedCapacity = params.flowTo.car[dir] * ROAD_USAGE_CAR + params.flowTo.bike[dir] * ROAD_USAGE_BIKE;
            const remainingCapacity = block.roadCapacity[dir] - usedCapacity;
            demandTo.car[dir] = params.flowTo.car[dir] + x * remainingCapacity * carPreference;
            demandTo.bike[dir] = params.flowTo.bike[dir] + x * remainingCapacity * (1 - carPreference);
        }
    }

    return {
        demandTo: demandTo,
        served: demand > 0 ? (servedInternal + flowToTotal) / demand : 1,
    };
}

function getParams(city, conditions, x, y) {
    const block = city.blocks[y][x];
    const prev = conditions[y][x];
    const demandFrom = {
        car: Object.values(DIR).map(() => 0),
        bike: Object.values(DIR).map(() => 0),
    };
    const flowTo = {
        car: Object.values(DIR).map(() => 0),
        bike: Object.values(DIR).map(() => 0),
    };
    const flowFrom = {
        car: Object.values(DIR).map(() => 0),
        bike: Object.values(DIR).map(() => 0),
    };

    var fill = (dir, idir, nx, ny, isBoundary, b) => {
        if (isBoundary) {
            // NOTE: we assume that bikes are mostly used inside of the city,
            // so boundary demand/supply is only cars
            demandFrom.car[dir] = city.boundaryDemand[dir][b];
            flowTo.car[dir] = Math.min(prev.demandTo.car[dir], city.boundarySupply[dir][b]);
            flowFrom.car[dir] = Math.min(
                block.roadCapacity[dir] / ROAD_USAGE_CAR,
                city.boundaryDemand[dir][b] * Math.min(prev.served, 1),
            );
        } else {
            const neighbor = conditions[ny][nx];
            demandFrom.car[dir] = neighbor.demandTo.car[idir];
            demandFrom.bike[dir] = neighbor.demandTo.bike[idir];
            flowTo.car[dir] = prev.demandTo.car[dir] * Math.min(neighbor.served, 1);
            flowTo.bike[dir] = prev.demandTo.bike[dir] * Math.min(neighbor.served, 1);
            flowFrom.car[dir] = neighbor.demandTo.car[idir] * Math.min(prev.served, 1);
            flowFrom.bike[dir] = neighbor.demandTo.bike[idir] * Math.min(prev.served, 1);
        }
    };

    fill(DIR.NORTH, DIR.SOUTH, x, y - 1, y === 0, x);
    fill(DIR.SOUTH, DIR.NORTH, x, y + 1, y === city.blocks.length - 1, x);
    fill(DIR.WEST, DIR.EAST, x - 1, y, x === 0, y);
    fill(DIR.EAST, DIR.WEST, x + 1, y, x === city.blocks[y].length - 1, y);

    return {
        demandFrom: demandFrom,
        flowTo: flowTo,
        flowFrom: flowFrom,
        pollution: sum(flowTo.car) + sum(flowFrom.car),
    };
}

function cityStep(city, conditions) {
    const next = city.blocks.map(row => row.map(() => null));
    city.blocks.forEach((row, y) => row.forEach((block, x) => {
        const params = getParams(city, conditions, x, y);
        next[y][x] = blockStep(block, params);
    }));
    return next;
}

export function solve(city, steps=100) {
    // step 1: calculate basic scores based on terrain
    city.blocks.forEach(row => row.forEach(block => {
        // TODO: different values based on wave function collapse
        const n = block.xAxis.length + block.yAxis.length;
        block.residential = (
            block.xAxis.filter(t => t === TERRAIN.RESIDENTIAL).length
            + block.yAxis.filter(t => t === TERRAIN.RESIDENTIAL).length
        ) / n;
        block.commercial = (
            block.xAxis.filter(t => t === TERRAIN.COMMERCIAL).length
            + block.yAxis.filter(t => t === TERRAIN.COMMERCIAL).length
        ) / n;
        block.green = (
            block.xAxis.filter(t => t === TERRAIN.GREENERY).length
            + block.yAxis.filter(t => t === TERRAIN.GREENERY).length
        ) / n;
        block.road = [
            block.xAxis.filter(t => t === TERRAIN.STREET).length / n,
            block.yAxis.filter(t => t === TERRAIN.STREET).length / n,
        ];
    }));

    city.blocks.forEach((row, y) => row.forEach((block, x) => {
        const setRoadCapacity = (dir, isBoundary, nx, ny) => {
            const axis = dirToAxis(dir);
            const neighbor = isBoundary ? 1 : city.blocks[ny][nx].road[axis];
            block.roadCapacity[dir] = Math.min(block.road[axis], neighbor) / 2;
        };

        block.roadCapacity = Object.values(DIR).map(() => 0);
        setRoadCapacity(DIR.NORTH, y === 0, x, y - 1);
        setRoadCapacity(DIR.SOUTH, y === city.blocks.length - 1, x, y + 1);
        setRoadCapacity(DIR.WEST, x === 0, x - 1, y);
        setRoadCapacity(DIR.EAST, x === row.length - 1, x + 1, y);
    }));

    // step 2: solve grid constraints
    let conditions = city.blocks.map(row => row.map(() => ({
        served: 1,
        demandTo: {
            car: [0, 0, 0, 0],
            bike: [0, 0, 0, 0],
        },
    })));
    for (let i = 0; i < steps; i++) {
        conditions = cityStep(city, conditions);
    }

    // step 3: deduce scores from grid solution
    city.blocks.forEach((row, y) => row.forEach((block, x) => {
        const condition = conditions[y][x];
        const params = getParams(city, conditions, x, y);
        block.flowTo = params.flowTo;
        block.flowFrom = params.flowFrom;

        block.commercialServed = condition.served;
        block.greenServed = block.green;
        block.pollution = params.pollution;
    }));
}
