import { Popover } from "@headlessui/react";
import { PencilIcon } from "@heroicons/react/24/solid";

const selectedDropboxLocation = "/home/mmmykhailo/Dropbox/Mykhailo";
const navigation = [
  { name: "Today", href: "#" },
  { name: "Month", href: "#" },
];

export default function Header() {
  return (
    <header className="bg-white shadow">
      <div className="px-2 mx-auto max-w-7xl sm:px-4 lg:px-8">
        <Popover className="flex justify-between h-16">
          <div className="flex flex-shrink-0 px-2 lg:px-0">
            <div className="flex items-center flex-shrink-0">
              <a href="#">
                <img
                  className="w-auto h-8"
                  src="https://tailwindui.com/img/logos/workflow-mark-blue-600.svg"
                  alt="Workflow"
                />
              </a>
            </div>
            <nav
              aria-label="Global"
              className="hidden lg:ml-6 lg:flex lg:items-center lg:space-x-4"
            >
              {navigation.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className="px-3 py-2 text-sm font-medium text-gray-900"
                >
                  {item.name}
                </a>
              ))}
            </nav>
          </div>
          <div className="flex items-center flex-shrink min-w-0 gap-4">
            <button
              className="min-w-0 py-2 px-3 w-[22em] shadow-sm text-gray-500 focus-visible:outline-blue-500 sm:text-sm border border-gray-300 rounded-md flex justify-between items-center gap-4 cursor-pointer"
              title={selectedDropboxLocation}
            >
              <span className="flex-shrink overflow-hidden text-ellipsis whitespace-nowrap">
                {selectedDropboxLocation}
              </span>
              <PencilIcon className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
        </Popover>
      </div>
    </header>
  );
}
