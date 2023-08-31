import clsx from "clsx";
import { FormEvent, Fragment, useEffect, useMemo, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/solid";
import ProjectSelector from "./ProjectSelector";
import ActivitySelector from "./ActivitySelector";
import DescriptionSelector from "./DescriptionSelector";
import useTimeInput from "../hooks/useTimeInput";
import {
  ReportActivity,
  calcDurationBetweenTimes,
  formatDuration,
  addSuggestions,
} from "../utils/reports";

type TrackTimeModalProps = {
  activities: Array<ReportActivity> | null;
  isOpen: boolean;
  editedActivity: ReportActivity | "new";
  latestProjAndAct: Record<string, [string]>;
  latestProjAndDesc: Record<string, [string]>;
  close: () => void;
  submitActivity: (
    activity: Omit<ReportActivity, "id"> & Pick<ReportActivity, "id">
  ) => void;
};

export default function TrackTimeModal({
  activities,
  isOpen,
  editedActivity,
  latestProjAndAct,
  latestProjAndDesc,
  close,
  submitActivity,
}: TrackTimeModalProps) {
  const [from, onFromChange, onFromBlur, setFrom] = useTimeInput();
  const [to, onToChange, onToBlur, setTo] = useTimeInput();
  const [project, setProject] = useState("");
  const [activity, setActivity] = useState("");
  const [description, setDescription] = useState("");
  const [isValidationEnabled, setIsValidationEnabled] = useState(false);

  const duration = useMemo(() => {
    if (!from.includes(":") || !to.includes(":")) return null;

    return calcDurationBetweenTimes(from, to);
  }, [from, to]);

  const formattedDuration = useMemo(() => {
    if (duration === null) return "";
    return formatDuration(duration);
  }, [duration]);

  const isFormInvalid = useMemo(() => {
    return !from || !to || !duration || duration < 0 || !project;
  }, [from, to, duration, project]);

  useEffect(() => {
    if (!editedActivity || editedActivity === "new") {
      resetModal();
      return;
    }

    setFrom(editedActivity.from || "");
    setTo(editedActivity.to || "");
    setProject(editedActivity.project || "");
    setActivity(editedActivity.activity || "");
    setDescription(editedActivity.description || "");
  }, [editedActivity]);

  useEffect(() => {
    if (editedActivity !== "new") {
      return;
    }
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, "0");
    const minutes = now.getMinutes().toString().padStart(2, "0");
    const floorMinutes = (Math.floor(Number(minutes) / 15) * 15)
      .toString()
      .padStart(2, "0");
    const ceilHours = Math.ceil(
      Number(minutes) / 15 > 3 ? Number(hours) + 1 : Number(hours)
    );
    const ceilMinutes = (
      Math.ceil(Number(minutes) / 15 > 3 ? 0 : Number(minutes) / 15) * 15
    )
      .toString()
      .padStart(2, "0");

    if (activities.length && activities[activities.length - 1].to) {
      setFrom(activities[activities.length - 1].to);
    } else if (activities.length && !activities[activities.length - 1].to) {
      setFrom(activities[activities.length - 1].from);
    } else {
      setFrom(`${hours}:${floorMinutes}`);
    }

    setTo(`${ceilHours}:${ceilMinutes}`);
  }, [isOpen]);

  useEffect(() => {
    addSuggestions(activities, latestProjAndDesc, latestProjAndAct);
  }, [isOpen, latestProjAndDesc, latestProjAndAct]);

  const onSave = (e: FormEvent | MouseEvent) => {
    e.preventDefault();

    if (isFormInvalid) {
      setIsValidationEnabled(true);
      return;
    }
    submitActivity({
      id: editedActivity === "new" ? null : editedActivity.id,
      from,
      to,
      duration,
      project,
      activity,
      description,
    });
    close();
  };

  const resetModal = () => {
    setFrom("");
    setTo("");
    setProject("");
    setActivity("");
    setDescription("");

    setIsValidationEnabled(false);
  };

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog
        as="div"
        className="fixed inset-0 z-10 overflow-y-auto"
        onClose={close}
      >
        <div className="flex items-end justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Dialog.Overlay className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" />
          </Transition.Child>

          {/* This element is to trick the browser into centering the modal contents. */}
          <span
            className="hidden sm:inline-block sm:align-middle sm:h-screen"
            aria-hidden="true"
          >
            &#8203;
          </span>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            enterTo="opacity-100 translate-y-0 sm:scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 translate-y-0 sm:scale-100"
            leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
          >
            <form
              className="relative inline-block px-4 pt-5 pb-4  text-left align-bottom transition-all transform bg-white rounded-lg shadow-xl sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6"
              onSubmit={onSave}
            >
              <div className="absolute top-0 right-0 hidden pt-4 pr-4 sm:block">
                <button
                  type="button"
                  className="text-gray-400 bg-white rounded-md hover:text-gray-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500"
                  onClick={close}
                  tabIndex={8}
                >
                  <span className="sr-only">Close</span>
                  <XMarkIcon className="w-6 h-6" aria-hidden="true" />
                </button>
              </div>
              <div className="mt-3 space-y-6 text-center sm:mt-0 sm:text-left">
                <Dialog.Title
                  as="h3"
                  className="text-lg font-medium leading-6 text-gray-900"
                >
                  Track time
                </Dialog.Title>
                <div className="grid grid-cols-6 gap-6">
                  <div className="col-span-6 sm:col-span-2">
                    <label
                      htmlFor="from"
                      className="block text-sm font-medium text-gray-700"
                    >
                      From
                    </label>
                    <input
                      required
                      value={from}
                      onChange={onFromChange}
                      onBlur={onFromBlur}
                      onFocus={(e) => e.target.select()}
                      type="text"
                      id="from"
                      tabIndex={1}
                      className={clsx(
                        "block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm",
                        {
                          "border-red-300 text-red-900 placeholder-red-300":
                            isValidationEnabled && !from,
                        }
                      )}
                    />
                  </div>

                  <div className="col-span-6 sm:col-span-2">
                    <label
                      htmlFor="to"
                      className="block text-sm font-medium text-gray-700"
                    >
                      To
                    </label>
                    <input
                      required
                      value={to}
                      onChange={onToChange}
                      onBlur={onToBlur}
                      onFocus={(e) => e.target.select()}
                      type="text"
                      id="to"
                      tabIndex={2}
                      className={clsx(
                        "block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm",
                        {
                          "border-red-300 text-red-900 placeholder-red-300":
                            isValidationEnabled && !to,
                        }
                      )}
                    />
                  </div>

                  <div className="col-span-6 sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Duration
                    </label>
                    <input
                      value={formattedDuration}
                      type="text"
                      readOnly
                      disabled
                      className={clsx(
                        "block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm",
                        {
                          "border-red-300 text-red-900 placeholder-red-300":
                            isValidationEnabled && (!duration || duration < 0),
                        }
                      )}
                    />
                  </div>

                  <div className="col-span-6">
                    <ProjectSelector
                      required
                      availableProjects={Object.keys(latestProjAndAct)}
                      selectedProject={project}
                      setSelectedProject={setProject}
                      isValidationEnabled={isValidationEnabled}
                      tabIndex={3}
                    />
                  </div>
                  <div className="col-span-6">
                    <ActivitySelector
                      availableActivities={latestProjAndAct[project]}
                      selectedActivity={activity}
                      setSelectedActivity={setActivity}
                      tabIndex={5}
                    />
                  </div>
                  <div className="col-span-6">
                    <DescriptionSelector
                      availableDescriptions={latestProjAndDesc[project]}
                      selectedDescription={description}
                      setSelectedDescription={setDescription}
                      tabIndex={4}
                    />
                  </div>
                </div>
              </div>
              <div className="mt-6">
                <div className="flex justify-end">
                  <button
                    onClick={close}
                    type="button"
                    tabIndex={7}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={onSave}
                    type="submit"
                    tabIndex={6}
                    className="inline-flex justify-center px-4 py-2 ml-3 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Save
                  </button>
                </div>
              </div>
            </form>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition.Root>
  );
}
