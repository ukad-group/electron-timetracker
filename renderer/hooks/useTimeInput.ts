import { ChangeEvent, SetStateAction, useState } from "react";

const useTimeInput = (
  initialTime = ""
): [
  string,
  (e: ChangeEvent<HTMLInputElement>) => void,
  () => void,
  (value: SetStateAction<string>) => void
] => {
  const [time, setTime] = useState(initialTime);

  const onTimeChange = (e: ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/[^0-9:]/g, ""); // Remove any non-numeric and non-colon characters

    if (value.split(":").length > 2) return;
    if (value.length > 5) return;
    // if (value.length > 2 && value[2] !== ":") return;

    if (time.length === 1 && value.length === 2 && value.slice(-1) !== ":") {
      value += ":";
    }

    if (
      time.length - value.length === 1 &&
      time.slice(-1) === ":" &&
      value.slice(-1) !== ":"
    ) {
      value = value.substring(0, value.length - 1);
    }

    // if (value[0] === ":") value = "0" + value;

    if (value.length > 2 && !value.includes(":")) return; // bogdan request to be able change hours in from/to fields, also commented 18 and 32 lines

    if (value.includes(":")) {
      const [hours, minutes] = value.split(":");

      const h = hours && parseInt(hours) > 23 ? "23" : hours;
      const m = minutes && parseInt(minutes) > 59 ? "59" : minutes;

      value = `${h}:${m}`;
    }

    setTime(value);
  };

  const onTimeBlur = () => {
    const [hours, minutes] = time.split(":");

    if (!hours) return;

    setTime(`${hours.padStart(2, "0")}:${(minutes || "").padStart(2, "0")}`);
  };

  return [time, onTimeChange, onTimeBlur, setTime];
};

export default useTimeInput;
