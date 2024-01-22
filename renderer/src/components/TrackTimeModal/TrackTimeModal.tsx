import clsx from "clsx";
import { FormEvent, useEffect, useMemo, useState, useRef } from "react";
import useTimeInput from "@/helpers/hooks/useTimeInput";
import {
  calcDurationBetweenTimes,
  formatDurationAsDecimals,
  addSuggestions,
  addDurationToTime,
} from "@/helpers/utils/reports";
import {
  padStringToMinutes,
  getDateTimeData,
} from "@/helpers/utils/datetime-ui";
import { AutocompleteSelector } from "@/shared/AutocompleteSelector";
import { shallow } from "zustand/shallow";
import { useScheduledEventsStore } from "@/store/googleEventsStore";
import { useTutorialProgressStore } from "@/store/tutorialProgressStore";
import { getJiraCardsFromAPI } from "@/helpers/utils/jira";
import { getAllTrelloCardsFromApi } from "@/helpers/utils/trello";
import { IPC_MAIN_CHANNELS } from "@electron/helpers/constants";
import { TrackTimeModalProps } from "./types";
import { Modal } from "@/shared/Modal";
import { TextField } from "@/shared/TextField";
import {
  changeMinutesAndHours,
  changeHours,
  getTimetrackerYearProjects,
} from "./utils";
import { Hint } from "@/shared/Hint";

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
  const [userTrelloTasks, setUserTrelloTasks] = useState([]);
  const [otherTrelloTasks, setOtherTrelloTasks] = useState([]);
  const [userJiraTasks, setUserJiraTasks] = useState([]);
  const [otherJiraTasks, setOtherJiraTasks] = useState([]);
  const [scheduledEvents, setScheduledEvents] = useScheduledEventsStore(
    (state) => [state.event, state.setEvent],
    shallow
  );
  const [progress, setProgress] = useTutorialProgressStore(
    (state) => [state.progress, state.setProgress],
    shallow
  );
  const [latestProjects, setLatestProjects] = useState([]);
  const [webTrackerProjects, setWebTrackerProjects] = useState([]);
  const [uniqueWebTrackerProjects, setUniqueWebTrackerProjects] = useState([]);
  const timeInputRef = useRef(null);
  const textInputRef = useRef(null);

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

  const thirdPartyItems = useMemo(() => {
    return [
      ...userTrelloTasks,
      ...userJiraTasks,
      ...otherTrelloTasks,
      ...otherJiraTasks,
    ];
  }, [userTrelloTasks, otherTrelloTasks, userJiraTasks, otherJiraTasks]);

  useEffect(() => {
    if (!editedActivity || editedActivity === "new") {
      resetModal();
      return;
    }

    if (editedActivity?.calendarId) {
      const lastRegistrationTo = activities[activities?.length - 2]?.to;

      padStringToMinutes(lastRegistrationTo) >
      padStringToMinutes(editedActivity?.from)
        ? setFrom(lastRegistrationTo || "")
        : setFrom(editedActivity?.from || "");
    } else {
      setFrom(editedActivity?.from || "");
    }

    setTo(editedActivity.to || "");
    setFormattedDuration(
      formatDurationAsDecimals(editedActivity.duration) || ""
    );
    setProject(editedActivity.project || "");
    setActivity(editedActivity.activity || "");
    setDescription(editedActivity.description || "");
  }, [editedActivity]);

  useEffect(() => {
    if (editedActivity !== "new") {
      return;
    }

    const { hours, floorMinutes, isToday, ceilHours, ceilMinutes } =
      getDateTimeData(selectedDate);

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
    const tempLatestProj = Object.keys(latestProjAndAct);

    if (webTrackerProjects) {
      const tempWebTrackerProjects = [];
      for (let i = 0; i < webTrackerProjects.length; i++) {
        if (!tempLatestProj.includes(webTrackerProjects[i])) {
          tempWebTrackerProjects.push(webTrackerProjects[i]);
          global.ipcRenderer.send(
            IPC_MAIN_CHANNELS.DICTIONATY_UPDATE,
            webTrackerProjects[i]
          );
        }
      }
      setUniqueWebTrackerProjects(tempWebTrackerProjects);
    }

    setLatestProjects(tempLatestProj);
  }, [isOpen, latestProjAndDesc, latestProjAndAct, webTrackerProjects]);

  useEffect(() => {
    if (duration === null || isTypingFromDuration) return;

    setFormattedDuration(formatDurationAsDecimals(duration));
  }, [from, to]);

  useEffect(() => {
    (async () => {
      const allTrelloCards = await getAllTrelloCardsFromApi();
      setUserTrelloTasks(allTrelloCards[0]);
      setOtherTrelloTasks(allTrelloCards[1]);

      const allJiraCards = await getJiraCardsFromAPI();
      setUserJiraTasks(allJiraCards[0]);
      setOtherJiraTasks(allJiraCards[1]);
    })();

    getTimetrackerYearProjects(setWebTrackerProjects);
  }, []);

  const onSave = (e: FormEvent | MouseEvent) => {
    e.preventDefault();

    if (isFormInvalid) {
      setIsValidationEnabled(true);
      return;
    }

    if (
      progress["shortcutsEditingConditions"] &&
      progress["shortcutsEditingConditions"][0]
    ) {
      progress["shortcutsEditingConditions"][1] = true;
      setProgress(progress);
    }
    let dashedDescription = description;

    if (description.includes(" - ")) {
      setDescription(description.replace(/ - /g, " -- "));
      dashedDescription = description.replace(/ - /g, " -- ");
    }

    submitActivity({
      id: editedActivity === "new" ? null : editedActivity.id,
      from,
      to,
      duration,
      project,
      activity,
      description: dashedDescription,
      calendarId: editedActivity === "new" ? null : editedActivity.calendarId,
    });

    if (
      !scheduledEvents[dashedDescription] &&
      editedActivity !== "new" &&
      editedActivity.calendarId?.length > 0
    ) {
      scheduledEvents[dashedDescription] = { project: "", activity: "" };
    }
    if (
      scheduledEvents[dashedDescription] &&
      !scheduledEvents[dashedDescription].project
    ) {
      scheduledEvents[dashedDescription].project = project;
    }

    if (
      scheduledEvents[dashedDescription] &&
      scheduledEvents[dashedDescription].activity !== activity
    ) {
      scheduledEvents[dashedDescription].activity = activity || "";
    }

    setScheduledEvents(scheduledEvents);

    global.ipcRenderer.send(IPC_MAIN_CHANNELS.ANALYTICS_DATA, "registrations", {
      registration: "time_registrations",
    });
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
    setFormattedDuration(formatDurationAsDecimals(duration));
  };

  const selectText = (e) => {
    e.target.select();
  };

  const handleKey = (
    event: React.KeyboardEvent<HTMLInputElement>,
    callback: (value: string) => void | undefined = undefined
  ) => {
    if (event.key === "ArrowUp" || event.key === "ArrowDown") {
      event.preventDefault();

      if (!callback) return;

      const input = event.target as HTMLInputElement;
      const value = input.value;

      if (value.length < 5) return;

      if (input.selectionStart === 0 && input.selectionEnd === value.length) {
        input.selectionStart = value.length;
        input.selectionEnd = value.length;
      }

      const cursorPosition = input.selectionStart;
      let [hours, minutes] = value.split(":").map(Number);

      if (cursorPosition > 2) {
        const [newMinutes, newHours] = changeMinutesAndHours(
          event.key,
          minutes,
          hours
        );
        minutes = newMinutes;
        hours = newHours;
      } else {
        hours = changeHours(event.key, hours);
      }

      const adjustedTime =
        hours.toString().padStart(2, "0") +
        ":" +
        minutes.toString().padStart(2, "0");

      input.value = adjustedTime;
      input.selectionStart = cursorPosition;
      input.selectionEnd = cursorPosition;
      callback(adjustedTime);
    }

    if (event.ctrlKey && event.key === "Enter") {
      event.preventDefault();
      onSave(event);
    }
  };

  return (
    <Modal isOpen={isOpen} onSubmit={onSave} onClose={close} title="Track time">
      <div className="grid grid-cols-6 gap-6">
        <div className="col-span-6 sm:col-span-2">
          <TextField
            id="from"
            ref={timeInputRef}
            label="From"
            onKeyDown={(event) => handleKey(event, setFrom)}
            required
            value={from}
            onChange={onFromChange}
            onBlur={onFromBlur}
            onFocus={selectText}
            tabIndex={1}
            className={clsx(
              "block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:border-dark-form-border dark:text-dark-heading dark:bg-dark-form-back focus:dark:border-focus-border focus:dark:ring-focus-border",
              {
                "border-red-300 text-red-900 placeholder-red-300 dark:border-red-700/40 dark:text-red-500 dark:placeholder-red-300":
                  isValidationEnabled && (!from || from.length < 5),
              }
            )}
            onDragStart={disableTextDrag}
          />
          <Hint
            learningMethod="nextClick"
            order={1}
            groupName="trackTimeModal"
            referenceRef={timeInputRef}
            shiftY={25}
            shiftX={300}
            width={"large"}
            position={{
              basePosition: "top",
              diagonalPosition: "right",
            }}
          >
            Upon form opening, the "from" time defaults to the prior entry's end
            time (if exists) or the current time, rounded to the nearest 15
            minutes.. The "to" time is set to the current time, rounded to the
            nearest 15 minutes. You can manually modify the time by 15-minute
            increments using the arrow keys. Alternatively, entering the desired
            duration will automatically adjust the "to" field accordingly.
          </Hint>
        </div>
        <div className="col-span-6 sm:col-span-2">
          <TextField
            id="to"
            label="To"
            onKeyDown={(event) => handleKey(event, setTo)}
            required
            value={to}
            onChange={onToChange}
            onBlur={onToBlur}
            onFocus={selectText}
            tabIndex={2}
            className={clsx(
              "block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:border-dark-form-border dark:text-dark-heading dark:bg-dark-form-back focus:dark:border-focus-border focus:dark:ring-focus-border",
              {
                "border-red-300 text-red-900 placeholder-red-300 dark:border-red-700/40 dark:text-red-500 dark:placeholder-red-300":
                  isValidationEnabled && (!to || to.length < 5),
              }
            )}
            onDragStart={disableTextDrag}
          />
        </div>

        <div className="col-span-6 sm:col-span-2">
          <TextField
            id="duration"
            label="Duration"
            onKeyDown={(event) => handleKey(event)}
            onChange={onDurationChange}
            onBlur={onDurationBlur}
            onFocus={selectText}
            value={formattedDuration}
            tabIndex={3}
            className={clsx(
              "block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:border-dark-form-border dark:text-dark-heading dark:bg-dark-form-back focus:dark:border-focus-border focus:dark:ring-focus-border",
              {
                "border-red-300 text-red-900 placeholder-red-300 dark:border-red-700/40 dark:text-red-500 dark:placeholder-red-300":
                  isValidationEnabled && (!duration || duration < 0),
              }
            )}
            onDragStart={disableTextDrag}
          />
        </div>
        <div className="col-span-6">
          <AutocompleteSelector
            isNewCheck
            onSave={onSave}
            title="Project"
            required
            availableItems={latestProjects}
            additionalItems={
              uniqueWebTrackerProjects ? uniqueWebTrackerProjects : []
            }
            selectedItem={project}
            setSelectedItem={setProject}
            isValidationEnabled={isValidationEnabled}
            showedSuggestionsNumber={Object.keys(latestProjAndAct).length}
            tabIndex={4}
          />
        </div>
        <div ref={textInputRef} className="col-span-6">
          <AutocompleteSelector
            isNewCheck
            onSave={onSave}
            title="Activity"
            availableItems={
              latestProjAndAct[project] ? latestProjAndAct[project] : []
            }
            selectedItem={activity}
            setSelectedItem={setActivity}
            showedSuggestionsNumber={3}
            tabIndex={5}
          />
        </div>
        <Hint
          learningMethod="nextClick"
          order={2}
          groupName="trackTimeModal"
          referenceRef={textInputRef}
          shiftY={175}
          shiftX={30}
          width={"medium"}
          position={{
            basePosition: "left",
            diagonalPosition: "top",
          }}
        >
          In the text fields, you'll find suggestions for projects, activities,
          and descriptions based on your usage in the past month. Upon linking
          the timetracker website, all company projects become available for
          selection. After connecting Trello and Jira, you'll be prompted to
          choose tasks from your boards in the description field, prioritizing
          those assigned to you.
        </Hint>
        <div className="col-span-6">
          <AutocompleteSelector
            onSave={onSave}
            title="Description"
            availableItems={
              latestProjAndDesc[project] ? latestProjAndDesc[project] : []
            }
            additionalItems={thirdPartyItems}
            selectedItem={description}
            setSelectedItem={setDescription}
            showedSuggestionsNumber={3}
            tabIndex={6}
            spellCheck
          />
        </div>
      </div>
    </Modal>
  );
}
