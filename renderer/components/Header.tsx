import { app, ipcRenderer } from "electron";
import { useEffect } from "react";
import { shallow } from "zustand/shallow";
import FolderSelector from "./FolderSelector";
import { useMainStore } from "../store/mainStore";
import { useBetaStore } from "../store/betaUpdatesStore";

export default function Header() {
  const [reportsFolder, setReportsFolder] = useMainStore(
    (state) => [state.reportsFolder, state.setReportsFolder],
    shallow
  );
  const [isBeta, setIsBeta] = useBetaStore(
    (state) => [state.isBeta, state.setIsBeta],
    shallow
  );
  useEffect(() => {
    ipcRenderer.send("beta-channel", isBeta);
  }, [isBeta]);
  return (
    <header className="bg-white shadow">
      <div className="flex justify-between h-16 px-2 mx-auto max-w-7xl sm:px-4 lg:px-8">
        <div className="flex w-full justify-between items-center flex-shrink min-w-0 gap-4">
          <label>
            <input
              type="checkbox"
              value="Give me beta diablo"
              defaultChecked={isBeta}
              onChange={() => setIsBeta(!isBeta)}
            />
            Give me beta diablo
          </label>
          {isBeta && "true"}
          <FolderSelector
            folderLocation={reportsFolder}
            setFolderLocation={setReportsFolder}
          />
        </div>
      </div>
    </header>
  );
}
