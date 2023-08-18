import { shallow } from "zustand/shallow";
import FolderSelector from "./FolderSelector";
import { useMainStore } from "../store/mainStore";

export default function Header() {
  const [reportsFolder, setReportsFolder] = useMainStore(
    (state) => [state.reportsFolder, state.setReportsFolder],
    shallow
  );

  return (
    <header className="bg-white shadow">
      <div className="flex justify-between h-16 px-2 mx-auto max-w-7xl sm:px-4 lg:px-8">
        <div className="flex flex-shrink-0 px-2 lg:px-0">
          Current version 1.0.33
        </div>
        <div className="flex items-center flex-shrink min-w-0 gap-4">
          <FolderSelector
            folderLocation={reportsFolder}
            setFolderLocation={setReportsFolder}
          />
        </div>
      </div>
    </header>
  );
}
