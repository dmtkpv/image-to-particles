export function getRandom ({ min, max }) {
    return min + (max - min) * Math.random()
}