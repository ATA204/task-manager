import React from "react";
import Progress from "../Progress";
import AvatarGroup from "./../layouts/AvatarGroup";
import moment from "moment";
import { LuPaperclip } from "react-icons/lu";
const TaskCard = ({
  key,
  title,
  description,
  piriority,
  status,
  progress,
  createdAt,
  dueDate,
  assignedTo,
  attachmentCount,
  completedTodoCount,
  todoChecklist,
  onClick,
}) => {
  const getStatusTagColor = () => {
    switch (status) {
      case "In Progress":
        return "text-cyan-500 bg-cyan-50 border border-cyan-500/10";
      case "Completed":
        return "text-lime-500 bg-lime-50 border border-lime-500/20";
      default:
        return "text-violet-500 bg-violet-50 border border-violet-500/10";
    }
  };

  const getPiriorityTagColor = () => {
    switch (piriority) {
      case "Low":
        return "text-emerald-500 bg-emerald-50 border border-emerald-500/10";
      case "Medium":
        return "text-amber-500 bg-amber-50 border border-amber-500/10";
      default:
        return "text-rose-500 bg-rose-50 border border-rose-500/10";
    }
  };
  return (
    <div className="bg-white cursor-pointer rounded-xl py-4 shadow-md shadow-gray-100 border border-gray-200/50 " onClick={onClick}>
      <div className="flex items-end gap-3 px-4 ">
        <div
          className={`${getStatusTagColor()} text-[11px] font-medium px-4 py-0.5 rounded`}
        >
          {status}
        </div>
        <div
          className={`${getPiriorityTagColor()} text-[11px] font-medium px-4 py-0.5 rounded`}
        >
          {piriority} piriority
        </div>
      </div>
      <div
        className={`border-l-[3px] px-4 ${
          status === "In Progress"
            ? "border-cyan-500"
            : status === "Completed"
            ? "border-indigo-500"
            : "border-violet-500"
        }`}
      >
        <p className="text-sm font-medium mt-4 text-gray-800 line-clamp-2">{title}</p>
        <p className="text-xs text-gray-500 mt-1.5 line-clamp-2 leading-[18p">{description}</p>
        <p className="text-[13px] text-gray-700/80 mt-2 mb-2 leading-[18px]  ">
          Task Done:{" "}
          <span className="text-semibold text-gray-700">
            {completedTodoCount}/{todoChecklist.length || 0}
          </span>
        </p>
        </div>
        <Progress progress={progress} status={status} />

        <div className="px-4">
          <div className="flex items-center justify-between my-1">
            <div>
              <label className="text-xs text-gray-500">Start At</label>
              <p className="text-gray-900 font-medium text-[13px] ">{moment(createdAt).format("Do MMM YYYY")}</p>
            </div>
            <div>
              <label className="text-xs text-gray-500">Due Date</label>
              <p className="text-gray-900 font-medium text-[13px] ">{moment(dueDate).format("Do MMM YYYY")}</p>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-between mt-3 px-2">
        <div>
          <AvatarGroup
          
          avatars={assignedTo||[]}/>
        </div>
        {attachmentCount>0&&(
          <div className="bg-blue-50 flex items-center gap-2 px-2.5 py-1.5 rounded-lg">
            <LuPaperclip className="text-primary"/>
            <span className="text-xs text-gray-900">
              {attachmentCount}
            </span>
          </div>

        )}
        </div>
      </div>

  );
};

export default TaskCard;
