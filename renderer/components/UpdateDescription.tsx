import { useState, useEffect } from "react";
import { shallow } from "zustand/shallow";
import { useUpdateStore } from "../store/updateStore";
import { useBetaStore } from "../store/betaUpdatesStore";
import DisclosureSection from "./ui/DisclosureSection";

type File = {
  url: string;
  sha512: string;
  size: number;
};

type Release = {
  files: File[];
  path: string;
  releaseDate: string;
  releaseName: string;
  releaseNotes: string;
  sha512: string;
  tag: string;
  version: string;
};

export default function UpdateDescription() {
  const [release, setRelease] = useState<Release | null>();
  const [currentVersion, setCurrentVersion] = useState(
    global.app?.getVersion()
  );
  const [isUpdate, setIsUpdate] = useState(false);
  const [update, setUpdate] = useUpdateStore(
    (state) => [state.update, state.setUpdate],
    shallow
  );
  const [isBeta, setIsBeta] = useBetaStore(
    (state) => [state.isBeta, state.setIsBeta],
    shallow
  );
  const [isOpen, setIsOpen] = useState(update?.age === "new");

  useEffect(() => {
    global.ipcRenderer.send("beta-channel", isBeta);
    global.ipcRenderer.send("get-current-version");

    global.ipcRenderer.on("update-available", (event, data, info) => {
      setIsUpdate(data);
    });

    global.ipcRenderer.on("downloaded", (event, data, info) => {
      setRelease(info);
      setIsOpen(true);
      setUpdate({ age: "new", description: info?.releaseNotes });
    });

    global.ipcRenderer.on("current-version", (event, data) => {
      setCurrentVersion(data);
    });

    return () => {
      global.ipcRenderer.removeAllListeners("update-available");
      global.ipcRenderer.removeAllListeners("downloaded");
      global.ipcRenderer.removeAllListeners("current-version");
    };
  }, [isBeta]);

  const isOpenToggle = () => {
    if (isOpen) {
      setIsOpen(false);
      setUpdate({ age: "old", description: update?.description });
    } else {
      setIsOpen(true);
      setUpdate({ age: "new", description: update?.description });
    }
  };
  return (
    <DisclosureSection
      toggleFunction={isOpenToggle}
      isOpen={isOpen}
      title="What's new?"
    >
      <p className="text-xs text-gray-700 font-semibold">
        Current version {currentVersion} {!isUpdate && "(latest)"}
      </p>
      <div className="relative flex items-start my-4">
        <div className="relative flex items-start my-4">
          <div className="flex items-center h-5">
            <input
              id="comments"
              aria-describedby="comments-description"
              name="comments"
              type="checkbox"
              defaultChecked={isBeta}
              onChange={() => setIsBeta(!isBeta)}
              className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
            />
          </div>
          <div className="ml-2 text-sm">
            <label htmlFor="comments" className="font-medium text-gray-700">
              Download beta version
            </label>
            <p id="comments-description" className="text-gray-500">
              You need to restart the application (or reopen from the tray)
            </p>
          </div>
        </div>
      </div>
      <h2 className="font-bold text-gray-700">
        In {release?.version ? release?.version : currentVersion} version
      </h2>
      {update?.description ? (
        <div
          className="flex flex-col gap-2 mb-3"
          dangerouslySetInnerHTML={{ __html: update?.description }}
        ></div>
      ) : (
        <div className="flex flex-col gap-2 mb-3">
          Here you will receive notifications about the app's content updates
          after downloading the new version.
        </div>
      )}
    </DisclosureSection>
  );
}
