import React from "react";

export default function DeleteTooltop({
  isDeleting,
  onDeleteActivity,
  activityId,
  setIsDeleting,
}) {
  return (
    <div
      className={`${
        isDeleting ? "visible opacity-100" : "invisible"
      } absolute flex flex-col gap-1 opacity-0 text-white font-normal text-xs bottom-[80%]  bg-blue-300 rounded-md p-[5px] transition -ml-[35px] after:absolute after:top-full after:left-1/2 after:-ml-[5px] after:border-[5px] after:border-t-blue-300 after:border-r-transparent after:border-b-transparent after:border-l-transparent`}
    >
      Delete this activity?
      <div className="flex justify-around">
        <button
          className="rounded-md bg-red-300 hover:bg-red-400 border border-red-400 w-8"
          onClick={() => {
            onDeleteActivity(activityId);
          }}
        >
          Si
        </button>
        <button
          className="rounded-md bg-gray-300 hover:bg-gray-400 border border-gray-400 w-8"
          onClick={() => setIsDeleting(false)}
        >
          No
        </button>
      </div>
    </div>
  );
}
