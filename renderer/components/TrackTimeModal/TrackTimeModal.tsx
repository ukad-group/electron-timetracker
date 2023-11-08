import clsx from "clsx";
import { FormEvent, Fragment, useEffect, useMemo, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/solid";
import useTimeInput from "../../hooks/useTimeInput";
import {
  ReportActivity,
  calcDurationBetweenTimes,
  formatDuration,
  addSuggestions,
  addDurationToTime,
} from "../../utils/reports";
import { checkIsToday } from "../../utils/datetime-ui";
import AutocompleteSelector from "../ui/AutocompleteSelector";
import Button from "../ui/Button";
import { shallow } from "zustand/shallow";
import { useGoogleCalendarStore } from "../../store/googleCalendarStore";
import { useScheduledEventsStore } from "../../store/googleEventsStore";
import { useThemeStore } from "../../store/themeStore";
import AddEventBtn, { Event } from "../AddEventBtn";
import {
  markActivityAsAdded,
  replaceHyphensWithSpaces,
} from "../../utils/utils";

export type TrackTimeModalProps = {
  activities: Array<ReportActivity> | null;
  isOpen: boolean;
  editedActivity: ReportActivity | "new";
  latestProjAndAct: Record<string, [string]>;
  latestProjAndDesc: Record<string, [string]>;
  close: () => void;
  submitActivity: (
    activity: Omit<ReportActivity, "id"> & Pick<ReportActivity, "id">
  ) => void;
  selectedDate: Date;
};

export default function TrackTimeModal({
  activities,
  isOpen,
  editedActivity,
  latestProjAndAct,
  latestProjAndDesc,
  close,
  submitActivity,
  selectedDate,
}: TrackTimeModalProps) {
  const [from, onFromChange, onFromBlur, setFrom] = useTimeInput();
  const [to, onToChange, onToBlur, setTo] = useTimeInput();
  const [formattedDuration, setFormattedDuration] = useState("");
  const [project, setProject] = useState("");
  const [activity, setActivity] = useState("");
  const [description, setDescription] = useState("");
  const [isTypingFromDuration, setIsTypingFromDuration] = useState(false);
  const [isValidationEnabled, setIsValidationEnabled] = useState(false);
  const [trelloTasks, setTrelloTasks] = useState([]);
  const [isDarkTheme, setIsDarkTheme] = useState(false);
  const [isOSDarkTheme, setIsOSDarkTheme] = useState(
    window.matchMedia("(prefers-color-scheme: dark)").matches
  );
  const { googleEvents, setGoogleEvents } = useGoogleCalendarStore();
  const loggedGoogleUsers = JSON.parse(localStorage.getItem("googleUsers"));
  const office365Users =
    JSON.parse(localStorage.getItem("office365-users")) || [];
  const trelloUser = JSON.parse(localStorage.getItem("trello-user")) || null;
  const [scheduledEvents, setScheduledEvents] = useScheduledEventsStore(
    (state) => [state.event, state.setEvent],
    shallow
  );
  const [theme, setTheme] = useThemeStore(
    (state) => [state.theme, state.setTheme],
    shallow
  );

  const duration = useMemo(() => {
    if (!from.includes(":") || !to.includes(":")) return null;

    return calcDurationBetweenTimes(from, to);
  }, [from, to]);

  const isFormInvalid = useMemo(() => {
    return (
      !from ||
      !to ||
      !duration ||
      duration < 0 ||
      !project ||
      to.length < 5 ||
      from.length < 5
    );
  }, [from, to, duration, project]);

  useEffect(() => {
    if (!editedActivity || editedActivity === "new") {
      resetModal();
      return;
    }

    setFrom(editedActivity.from || "");
    setTo(editedActivity.to || "");
    setFormattedDuration(formatDuration(editedActivity.duration) || "");
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
    const isToday = checkIsToday(selectedDate);

    if (activities?.length && activities[activities?.length - 1].to) {
      setFrom(activities[activities?.length - 1].to);
    } else if (activities.length && !activities[activities?.length - 1].to) {
      setFrom(activities[activities?.length - 1].from);
    } else {
      setFrom(`${hours}:${floorMinutes}`);
    }

    isToday ? setTo(`${ceilHours}:${ceilMinutes}`) : setTo("");
  }, [isOpen]);

  useEffect(() => {
    addSuggestions(activities, latestProjAndDesc, latestProjAndAct);
  }, [isOpen, latestProjAndDesc, latestProjAndAct]);

  useEffect(() => {
    if (duration === null || isTypingFromDuration) return;

    setFormattedDuration(formatDuration(duration));
  }, [from, to]);

  const getTrelloCards = async () => {
    try {
      const trelloCards = await global.ipcRenderer.invoke(
        "trello:get-cards",
        trelloUser.accessToken
      );

      const newTrelloTasks = trelloCards.map((card) =>
        replaceHyphensWithSpaces(`TT:: ${card.name} ${card.shortUrl}`)
      );

      setTrelloTasks(newTrelloTasks);
    } catch (error) {
      localStorage.removeItem("trello-user");
      setTrelloTasks([]);
    }
  };

  useEffect(() => {
    if (trelloUser) (async () => getTrelloCards())();
  }, []);

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
      calendarId: editedActivity === "new" ? null : editedActivity.calendarId,
    });

    if (scheduledEvents[description] && !scheduledEvents[description].project) {
      scheduledEvents[description].project = project;
    }
    if (
      scheduledEvents[description] &&
      scheduledEvents[description].activity !== activity
    ) {
      scheduledEvents[description].activity = activity || "";
    }

    setScheduledEvents(scheduledEvents);
    if (googleEvents.length > 0 && editedActivity !== "new") {
      const arrayWithMarkedActivty = markActivityAsAdded(
        googleEvents,
        editedActivity
      );

      const arrayWithPrefilledValue = arrayWithMarkedActivty.map((gEvent) => {
        if (gEvent.summary === editedActivity.description) {
          if (project) gEvent.project = project;
          if (activity) gEvent.activity = activity;
        }

        return gEvent;
      });

      localStorage.setItem(
        "googleEvents",
        JSON.stringify(arrayWithPrefilledValue)
      );
      setGoogleEvents(arrayWithPrefilledValue);
    }

    close();
  };

  const resetModal = () => {
    setFrom("");
    setTo("");
    setFormattedDuration("");
    setProject("");
    setActivity("");
    setDescription("");
    setIsValidationEnabled(false);
  };

  const disableTextDrag = (e) => {
    e.preventDefault();
  };

  const onDurationChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const value = e.target.value;
    const formatDurationRegex = /^-?(\d*\.?\d*)?[hm]?$|^-?[hm](?![hm.])$/i;

    if (formatDurationRegex.test(value)) {
      setIsTypingFromDuration(true);
      setFormattedDuration(value);
      setTo(addDurationToTime(from, value));
    }
  };

  const onDurationBlur = () => {
    setIsTypingFromDuration(false);
    setFormattedDuration(formatDuration(duration));
  };

  const selectText = (e) => {
    e.target.select();
  };

  const addEventToList = (event: Event) => {
    const { from, to, project, activity, description } = event;
    if (scheduledEvents[description]) {
      setProject(scheduledEvents[description].project);
      setActivity(activity || scheduledEvents[description].activity);
    }
    if (!scheduledEvents[description]) {
      setProject(project || "");
      setActivity(activity || "");
      scheduledEvents[description] = { project: "", activity: "" };
      scheduledEvents[description].project = project || "";
      scheduledEvents[description].activity = activity || "";
    }

    setFrom(from.time || "");
    setTo(to.time || "");
    setDescription(description || "");
    setScheduledEvents(scheduledEvents);
  };

  const handleKey = (event) => {
    if (event.ctrlKey && event.key === "Enter") {
      event.preventDefault();
      onSave(event);
    }
  };

  function handleThemeChange(e) {
    if (e.matches) {
      setIsOSDarkTheme(true);
    } else {
      setIsOSDarkTheme(false);
    }
  }

  useEffect(() => {
    window
      .matchMedia("(prefers-color-scheme: dark)")
      .addListener(handleThemeChange);
    console.log(theme);

    setIsDarkTheme(theme.os ? isOSDarkTheme : theme.custom === "dark");
  }, [theme, isOSDarkTheme]);
  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog
        as="div"
        className="fixed inset-0 z-10 overflow-y-auto"
        onClose={close}
      >
        <div
          className={clsx(
            "flex items-end justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0",
            { dark: isDarkTheme }
          )}
        >
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Dialog.Overlay className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75 dark:bg-gray-900/80" />
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
              className="relative inline-block px-4 pt-5 pb-4  text-left align-bottom transition-all transform bg-white rounded-lg shadow-xl sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6 dark:bg-dark-container dark:border dark:border-dark-border"
              onSubmit={onSave}
            >
              <div className="absolute top-0 right-0 hidden pt-4 pr-4 sm:block">
                <button
                  type="button"
                  className="text-gray-400 bg-white rounded-md hover:text-gray-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500 dark:bg-transparent"
                  onClick={close}
                  tabIndex={9}
                >
                  <span className="sr-only">Close</span>
                  <XMarkIcon className="w-6 h-6" aria-hidden="true" />
                </button>
              </div>
              <div className="mt-3 space-y-6 text-center sm:mt-0 sm:text-left">
                <Dialog.Title
                  as="h3"
                  className="text-lg font-medium leading-6 text-gray-900 dark:text-dark-heading"
                >
                  Track time
                </Dialog.Title>
                <div className="grid grid-cols-6 gap-6">
                  <div className="col-span-6 sm:col-span-2">
                    <label
                      htmlFor="from"
                      className="block text-sm font-medium text-gray-700 dark:text-dark-main"
                    >
                      From
                    </label>
                    <input
                      onKeyDown={(event: FormEvent) => handleKey(event)}
                      required
                      value={from}
                      onChange={onFromChange}
                      onBlur={onFromBlur}
                      onFocus={selectText}
                      type="text"
                      id="from"
                      tabIndex={1}
                      className={clsx(
                        "block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:border-dark-form-border dark:text-dark-heading dark:bg-dark-form-back focus:dark:border-focus-border focus:dark:ring-focus-border",
                        {
                          "border-red-300 text-red-900 placeholder-red-300":
                            isValidationEnabled && (!from || from.length < 5),
                        }
                      )}
                      onDragStart={disableTextDrag}
                    />
                  </div>

                  <div className="col-span-6 sm:col-span-2">
                    <label
                      htmlFor="to"
                      className="block text-sm font-medium text-gray-700 dark:text-dark-main"
                    >
                      To
                    </label>
                    <input
                      onKeyDown={(event: FormEvent) => handleKey(event)}
                      required
                      value={to}
                      onChange={onToChange}
                      onBlur={onToBlur}
                      onFocus={selectText}
                      type="text"
                      id="to"
                      tabIndex={2}
                      className={clsx(
                        "block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:border-dark-form-border dark:text-dark-heading dark:bg-dark-form-back focus:dark:border-focus-border focus:dark:ring-focus-border",
                        {
                          "border-red-300 text-red-900 placeholder-red-300":
                            isValidationEnabled && (!to || to.length < 5),
                        }
                      )}
                      onDragStart={disableTextDrag}
                    />
                  </div>

                  <div className="col-span-6 sm:col-span-2">
                    <label
                      htmlFor="duration"
                      className="block text-sm font-medium text-gray-700 dark:text-dark-main"
                    >
                      Duration
                    </label>
                    <input
                      onKeyDown={(event: FormEvent) => handleKey(event)}
                      onChange={onDurationChange}
                      onBlur={onDurationBlur}
                      onFocus={selectText}
                      value={formattedDuration}
                      type="text"
                      id="duration"
                      tabIndex={3}
                      className={clsx(
                        "block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:border-dark-form-border dark:text-dark-heading dark:bg-dark-form-back focus:dark:border-focus-border focus:dark:ring-focus-border",
                        {
                          "border-red-300 text-red-900 placeholder-red-300":
                            isValidationEnabled && (!duration || duration < 0),
                        }
                      )}
                      onDragStart={disableTextDrag}
                    />
                  </div>

                  <div className="col-span-6">
                    <AutocompleteSelector
                      onSave={onSave}
                      title="Project"
                      required
                      availableItems={
                        latestProjAndAct ? Object.keys(latestProjAndAct) : []
                      }
                      selectedItem={project}
                      setSelectedItem={setProject}
                      isValidationEnabled={isValidationEnabled}
                      isLastThree={false}
                      tabIndex={4}
                    />
                  </div>
                  <div className="col-span-6">
                    <AutocompleteSelector
                      onSave={onSave}
                      title="Activity"
                      availableItems={
                        latestProjAndAct ? latestProjAndAct[project] : []
                      }
                      selectedItem={activity}
                      setSelectedItem={setActivity}
                      isLastThree={true}
                      tabIndex={5}
                    />
                  </div>
                  <div className="col-span-6">
                    <AutocompleteSelector
                      onSave={onSave}
                      title="Description"
                      availableItems={
                        latestProjAndDesc[project]
                          ? [...latestProjAndDesc[project], ...trelloTasks]
                          : trelloTasks
                      }
                      selectedItem={description}
                      setSelectedItem={setDescription}
                      isLastThree={true}
                      tabIndex={6}
                    />
                  </div>
                </div>
              </div>
              <div className="mt-6">
                <div className="flex gap-3 justify-between">
                  <div className="flex gap-3 justify-start">
                    {checkIsToday(selectedDate) &&
                      (loggedGoogleUsers?.length > 0 ||
                        office365Users.length > 0) && (
                        <AddEventBtn
                          addEvent={addEventToList}
                          availableProjects={
                            latestProjAndAct
                              ? Object.keys(latestProjAndAct)
                              : []
                          }
                        />
                      )}
                  </div>
                  <div className="flex gap-3 justify-end">
                    <Button
                      text="Cancel"
                      type={"button"}
                      callback={close}
                      status={"cancel"}
                      tabIndex={8}
                    />
                    <Button
                      text="Save"
                      type={"submit"}
                      status={"enabled"}
                      tabIndex={7}
                    />
                  </div>
                </div>
              </div>
            </form>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition.Root>
  );
}
