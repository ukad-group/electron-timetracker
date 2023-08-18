import {calcDurationBetweenTimes, formatDuration, parseReport, serializeReport} from './reports';

const parsedReport = (activity) => {
    return parseReport(activity)[0];
}

describe('parseReport function', () => {

    test('should return empty collection when null or empty string is passed', () => {
        expect(parseReport(undefined)).toStrictEqual([]);
        expect(parseReport(null)).toStrictEqual([]);
        expect(parseReport('')).toStrictEqual([]);
    });

    test('should skip lines which are not started from time pattern hh:mm', () => {
        expect(parsedReport('skip this line/nand this line')).toStrictEqual([]);
    });

    test('should extract [project name], [activity name] and [description] from registration', () => {
        const dayReport = parsedReport('18:00 2013-05-05 - project - activity - description\n19:00 2013-05-05');
        const registration = dayReport[0];

        expect(dayReport.length).toBeGreaterThan(0);
        expect(registration).toHaveProperty('project', 'project');
        expect(registration).toHaveProperty('activity', 'activity');
        expect(registration).toHaveProperty('description', 'description');
    });

    test('should support spaces in [project name], [activity name] and [description]', () => {
        const dayReport = parsedReport('18:00 2013-05-05 - pro ject - act ivity - des cription\n19:00 2013-05-05');
        const registration = dayReport[0];

        expect(dayReport.length).toBeGreaterThan(0);
        expect(registration).toHaveProperty('project', 'pro ject');
        expect(registration).toHaveProperty('activity', 'act ivity');
        expect(registration).toHaveProperty('description', 'des cription');
    });

    test('should extract [project name] when [activity] and [description] are not set', () => {
        const dayReport = parsedReport('18:00 2013-05-05 - project\n19:00 2013-05-05');
        const registration = dayReport[0];

        expect(dayReport.length).toBeGreaterThan(0);
        expect(registration).toHaveProperty('project', 'project');
    });

    test('should extract [project name] and [description] when [activity] is not set', () => {
        const dayReport = parsedReport('18:00 2013-05-05 - project - description\n19:00 2013-05-05');
        const registration = dayReport[0];

        expect(dayReport.length).toBeGreaterThan(0);
        expect(registration).toHaveProperty('project', 'project');
        expect(registration).toHaveProperty('description', 'description');
    });

    test('should lowercase project name', () => {
        const dayReport = parsedReport('18:00 2013-05-05 - prOjEct - ActIvItY - dEscrIptIOn\n19:00 2013-05-05');
        const registration = dayReport[0];

        expect(dayReport.length).toBeGreaterThan(0);
        expect(registration).toHaveProperty('project', 'project');
    });

    // should lowercase activity name before 26 Aug 2016 - is it actual?

    test('should keep activity name case sensitive after 26 Aug 2016', () => {
        const dayReport = parsedReport('18:00 2013-05-05 - prOjEct - ActIvItY - dEscrIptIOn\n19:00 2013-05-05');
        const registration = dayReport[0];

        expect(dayReport.length).toBeGreaterThan(0);
        expect(registration).toHaveProperty('activity', 'ActIvItY');
    });

    test('should keep description case sensitive', () => {
        const dayReport = parsedReport('18:00 2013-05-05 - prOjEct - ActIvItY - dEscrIptIOn\n19:00 2013-05-05');
        const registration = dayReport[0];

        expect(dayReport.length).toBeGreaterThan(0);
        expect(registration).toHaveProperty('description', 'dEscrIptIOn');
    });

    // test('should skip the latest time line when it is only contains time "19:00" without project name', () => {
    //     const dayReport = parsedReport('18:00 2013-05-05 - project - activity - description\n19:00');
    //
    //     expect(dayReport.length).toBe(1);
    // });

    test('should parse the line when backslash "/" or slash "\\" are used in description', () => {
        const dayReport = parsedReport('18:00 2013-05-05 - project - activity - de \\ scription /\n19:00 2013-05-05');
        const registration = dayReport[0];

        expect(dayReport.length).toBeGreaterThan(0);
        expect(registration).toHaveProperty('description', 'de \\ scription /');
    });

    // should set IsWorkingTime to False when line stars from ! - on C# tests
    test('should set isBreak to true when line stars from !', () => {
        const dayReport = parsedReport('18:00 2013-05-05 - !\n19:00 2013-05-05');
        const registration = dayReport[0];

        expect(dayReport.length).toBeGreaterThan(0);
        expect(registration).toHaveProperty('isBreak', true);
    });

    test('should parse time', () => {
        const dayReport = parsedReport('18:00 2013-05-05 - project - activity - description\n19:00 2013-05-05');
        const registration = dayReport[0];

        expect(dayReport.length).toBeGreaterThan(0);
        expect(registration).toHaveProperty('from', '18:00');
        expect(registration).toHaveProperty('to', '19:00');
    });

    // 'should calcualate time spent on task in minutes' - is it actual?

    test('should support . in [project name], [activity name] and [description]', () => {
        const dayReport = parsedReport('18:00 2013-05-05 - pro.ject - act.ivity - des.cription\n19:00 2013-05-05');
        const registration = dayReport[0];

        expect(dayReport.length).toBeGreaterThan(0);
        expect(registration).toHaveProperty('project', 'pro.ject');
        expect(registration).toHaveProperty('activity', 'act.ivity');
        expect(registration).toHaveProperty('description', 'des.cription');
    });

    // should set StartTime and EndTime in date when registration was made - is it actual?


});

describe('serializeReport function', () => {
    const activities = [{
        id: 1,
        activity: 'meeting',
        description: 'calendar discussion',
        duration: 1800000,
        from: '11:30',
        project: 'timetracker',
        to: '12:00'
    }];

    const report = '11:30 - timetracker - meeting - calendar discussion\n' + '12:00 - !\n';

    test('should return serialized report', () => {
        expect(serializeReport(activities)).toBe(report);
    });
});

describe('calcDurationBetweenTimes function', () => {
    test('should return null when from or/and to properties is undefined', () => {
        expect(calcDurationBetweenTimes(undefined, '10:00')).toBeNull();
        expect(calcDurationBetweenTimes('10:00', undefined)).toBeNull();
        expect(calcDurationBetweenTimes(undefined, undefined)).toBeNull();
    });

    test('should return result of to - from in milliseconds', () => {
        expect(calcDurationBetweenTimes('10:00', '10:10')).toBe(600000);
    });
});

describe('formatDuration function', () => {

    test('should return undefined when ms = undefined', () => {
        expect(formatDuration(undefined)).toBeUndefined();
    });

    test('should return 0m when ms < 1m', () => {
        expect(formatDuration(1000)).toBe('0m');
    });

    test('should return minutes when ms < 1h', () => {
        const ms = 2000000;
        const minutes = ms / 1000 / 60;
        expect(formatDuration(ms)).toBe(Math.round(minutes) + 'm');
    });

    test('should return hours when ms > 1h', () => {
        const ms = 20000000;
        const hours = ms / 1000 / 60 / 60;
        expect(formatDuration(ms)).toBe(Math.floor(hours * 100) / 100 + 'h');
    });
});
