import { ipcRenderer } from "electron";
import FolderSelector from "./FolderSelector";
import { useEffect, useState } from "react";

const navigation = [
  { name: "Today", href: "#" },
  { name: "Month", href: "#" },
];

export default function Header() {
  const [selectedDropboxLocation, setSelectedDropboxLocation] = useState("");

  const handleDropboxLocationChange = (path: string) => {
    setSelectedDropboxLocation(path);
    ipcRenderer.invoke("app:set-dropbox-folder", path);
  };

  useEffect(() => {
    (async () => {
      const savedLocation = await ipcRenderer.invoke("app:get-dropbox-folder");
      if (savedLocation) {
        setSelectedDropboxLocation(savedLocation);
      }
    })();
  }, []);

  return (
    <header className="bg-white shadow">
      <div className="flex justify-between h-16 px-2 mx-auto max-w-7xl sm:px-4 lg:px-8">
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
          <FolderSelector
            folderLocation={selectedDropboxLocation}
            setFolderLocation={handleDropboxLocationChange}
          />
        </div>
      </div>
    </header>
  );
}
