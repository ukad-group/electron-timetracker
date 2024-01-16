const HelpSection = () => (
  <section className="h-full">
    <div className="overflow-y-auto h-full bg-white sm:rounded-lg p-2 flex flex-col gap-6 dark:bg-dark-container">
      <div className="flex flex-col gap-1">
        <span className="text-lg font-medium text-gray-900 dark:text-dark-heading">
          Shortcuts
        </span>
        <div className="px-4 text-gray-500 dark:text-dark-main">
          <h2 className="text-lg font-semibold mt-4 mb-2 text-gray-900 dark:text-dark-heading">
            Global Shortcuts
          </h2>
          <ul className="list-disc pl-4">
            <li>
              <strong className="mr-2">Ctrl + Z:</strong> Undo changes
            </li>
            <li>
              <strong className="mr-2">Ctrl + Y:</strong> Redo changes
            </li>
            <li>
              <strong className="mr-2">Tab:</strong> Move forward (Next)
            </li>
            <li>
              <strong className="mr-2">Shift + Tab:</strong> Move backward
              (Previous)
            </li>
          </ul>
          <h2 className="text-lg font-semibold mt-4 mb-2 text-gray-900 dark:text-dark-heading">
            Main Screen
          </h2>
          <ul className="list-disc pl-4">
            <li>
              <strong className="mr-2">Ctrl + Space:</strong> Add a new
              registration
            </li>
            <li>
              <strong className="mr-2">Ctrl + ArrowUp:</strong> Edit last
              registration
            </li>
            <li>
              <strong className="mr-2">Ctrl + [number]:</strong> Edit specific
              registration (replace [number] with the actual number)
            </li>
          </ul>

          <h2 className="text-lg font-semibold mt-4 mb-2 text-gray-900 dark:text-dark-heading">
            Main Screen - Manual Input
          </h2>
          <ul className="list-disc pl-4">
            <li>
              <strong className="mr-2">Ctrl + D:</strong> Duplicate string
            </li>
            <li>
              <strong className="mr-2">Ctrl + S:</strong> Save changes
            </li>
          </ul>

          <h2 className="text-lg font-semibold mt-4 mb-2 text-gray-900 dark:text-dark-heading">
            Track Time Form
          </h2>
          <ul className="list-disc pl-4">
            <li>
              <strong className="mr-2">Ctrl + Enter:</strong> Force Save
            </li>
            <li>
              <strong className="mr-2">Esc:</strong> Close the suggestions
              dropdown.
            </li>
            <li>
              <strong className="mr-2">ArrowUp (on time field):</strong>{" "}
              Increase time by 15 minutes.
            </li>
            <li>
              <strong className="mr-2">ArrowDown (on time field):</strong>{" "}
              Decrease time by 15 minutes.
            </li>
          </ul>
        </div>
      </div>
    </div>
  </section>
);
export default HelpSection;
