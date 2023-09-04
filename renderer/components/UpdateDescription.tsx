import clsx from "clsx";
import { app, ipcRenderer } from "electron";
import { useState } from "react";
import { shallow } from "zustand/shallow";
import { useUpdateStore } from "../store/updateStore";

export default function UpdateDescription() {
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
  const [release, setRelease] = useState<Release | null>();
  const [currentVersion, setCurrentVersion] = useState(app?.getVersion());
  const [update, setUpdate] = useUpdateStore(
    (state) => [state.update, state.setUpdate],
    shallow
  );

  ipcRenderer.on("downloaded", (event, data, info) => {
    setRelease(info);
    setUpdate({ age: "new", description: info?.releaseNotes });
  });
  ipcRenderer.on("current-version", (event, data) => {
    setCurrentVersion(data);
  });

  const isUpdateToggle = () => {
    if (update.age === "old") {
      setUpdate({ age: "new", description: update.description });
    } else {
      setUpdate({ age: "old", description: update.description });
    }
  };
  return (
    <div
      className={clsx(
        "lg:absolute h-16 px-4 py-5 my-6 bg-white shadow overflow-hidden transition-all ease-linear duration-300 sm:rounded-lg sm:px-6",
        {
          "h-52": update.age === "new",
        }
      )}
    >
      <div>
        <div
          className="flex justify-between cursor-pointer"
          onClick={isUpdateToggle}
        >
          <h2
            id="manual-input-title"
            className="text-lg font-medium text-gray-900"
          >
            What's new in {release?.version ? release?.version : currentVersion}{" "}
            version
          </h2>
          <button
            className={clsx(
              "transform transition-transform ease-linear duration-300",
              {
                "rotate-180": update.age === "new",
              }
            )}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#000000"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M6 9l6 6 6-6" />
            </svg>
          </button>
        </div>
        <div
          className="flex flex-col gap-2 mt-3 h-32 overflow-y-auto"
          dangerouslySetInnerHTML={{ __html: update.description }}
        ></div>
      </div>
    </div>
  );
}
