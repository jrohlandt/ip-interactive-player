import { generateRandomInt } from './utils.js';

test('it generates an random integer between min and max', () => {
    const min = 10000000;
    const max = 90000000;
    const rand = generateRandomInt(min, max);
    console.log(rand);
    expect(rand >= min && rand <= max).toBe(true);
}); 