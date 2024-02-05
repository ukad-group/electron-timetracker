import {
  changeHours,
  changeMinutesAndHours,
} from '../utils';
import { KEY_CODES } from '@/helpers/contstants';

describe('GIVEN changeHours', () => {
  it('should increment hours when ArrowUp key is pressed', () => {
    expect(changeHours(KEY_CODES.ARROW_UP, 5)).toBe(6);
  });

  it('should decrement hours when ArrowDown key is pressed', () => {
    expect(changeHours(KEY_CODES.ARROW_DOWN, 5)).toBe(4);
  });

  it('should reset hours to 23 if it goes below 0', () => {
    expect(changeHours(KEY_CODES.ARROW_DOWN, 0)).toBe(23);
  });

  it('should reset hours to 0 if it goes above or equal to 24', () => {
    expect(changeHours(KEY_CODES.ARROW_UP, 23)).toBe(0);
    expect(changeHours(KEY_CODES.ARROW_UP, 24)).toBe(0);
  });
});

describe('GIVEN changeMinutesAndHours', () => {
  it('should increment minutes by 15 when ArrowUp key is pressed', () => {
    expect(changeMinutesAndHours(KEY_CODES.ARROW_UP, 30, 5)).toEqual([45, 5]);
  });

  it('should decrement minutes by 15 when ArrowDown key is pressed', () => {
    expect(changeMinutesAndHours(KEY_CODES.ARROW_DOWN, 30, 5)).toEqual([15, 5]);
  });

  it('should handle hour change when minutes go below 0', () => {
    expect(changeMinutesAndHours(KEY_CODES.ARROW_DOWN, 10, 1)).toEqual([55, 0]);
  });

  it('should handle hour change when minutes go above or equal to 60', () => {
    expect(changeMinutesAndHours(KEY_CODES.ARROW_UP, 50, 1)).toEqual([5, 2]);
    expect(changeMinutesAndHours(KEY_CODES.ARROW_UP, 60, 1)).toEqual([15, 2]);
  });
});

// Need to figure out how to cover the getTimetrackerYearProjects util function.
// ...
