export default function Table() {
  const activities = [
    {
      id: 0,
      time: "1.5h",
      interval: "10:00 - 10:30",
      project: "ajp",
      activity: "AJ-1337",
      description: "",
    },
    {
      id: 1,
      time: "1h",
      interval: "10:30 - 11:00",
      project: "ajp",
      activity: "meeting with FE team",
      description: "",
    },
  ];
  return (
    <table className="min-w-full divide-y divide-gray-300">
      <thead>
        <tr>
          <th
            scope="col"
            className="pb-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6 md:pl-0"
          >
            Interval
          </th>
          <th
            scope="col"
            className="pb-3.5 px-3 text-left text-sm font-semibold text-gray-900"
          >
            Time
          </th>
          <th
            scope="col"
            className="pb-3.5 px-3 text-left text-sm font-semibold text-gray-900"
          >
            Project
          </th>
          <th
            scope="col"
            className="pb-3.5 px-3 text-left text-sm font-semibold text-gray-900"
          >
            Activity
          </th>
          <th
            scope="col"
            className="pb-3.5 px-3 text-left text-sm font-semibold text-gray-900"
          >
            Description
          </th>
          <th scope="col" className="relative pb-3.5 pl-3 pr-4 sm:pr-6 md:pr-0">
            <span className="sr-only">Edit</span>
          </th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-200">
        {activities.map((activity) => (
          <tr key={activity.id}>
            <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm text-gray-500 sm:pl-6 md:pl-0">
              {activity.interval}
            </td>
            <td className="whitespace-nowrap py-4 px-3 text-sm font-medium text-gray-900">
              {activity.time}
            </td>
            <td className="whitespace-nowrap py-4 px-3 text-sm font-medium text-gray-900">
              {activity.project}
            </td>
            <td className="whitespace-nowrap py-4 px-3 text-sm font-medium text-gray-900">
              {activity.activity}
            </td>
            <td className="whitespace-nowrap py-4 px-3 text-sm text-gray-500">
              {activity.description}
            </td>
            <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6 md:pr-0">
              <a href="#" className="text-blue-600 hover:text-blue-900">
                Edit
                <span className="sr-only">
                  , {activity.activity || activity.description}
                </span>
              </a>
            </td>
          </tr>
        ))}
        <tr>
          <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm text-gray-500 sm:pl-6 md:pl-0">
            Total
          </td>
          <td className="whitespace-nowrap py-4 px-3 text-sm font-medium text-gray-900">
            2.5h
          </td>
          <td
            className="whitespace-nowrap py-4 px-3 text-sm font-medium text-gray-900"
            colSpan={4}
          >
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
              less than 8h
            </span>
          </td>
        </tr>
      </tbody>
    </table>
  );
}
