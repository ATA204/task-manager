import React from "react";
import moment from "moment";

const TaskListTable = ({ tableData }) => {
  const getStatusBadgeColor = (status) => {
    switch (status) {
      case "Completed":
        return `bg-green-100 text-green-500 border boredr-green-200`;
      case "In Progress":
        return `bg-cyan-100 text-cyan-500 border boredr-cyan-200`;
      case "Pending":
        return `bg-purple-100 text-purple-500 border boredr-purple-200`;
      default:
        return `bg-gray-100 text-gray-500 border boredr-gray-200`;
    }
  };
  const getPiriorityBadgeColor = (piriority) => {
    switch (piriority) {
      case "High":
        return `bg-red-100 text-red-500 border border-red-200`;
      case "Medium":
        return `bg-orange-100 text-orange-500 border border-orange-200`;
      case "Low":
        return `bg-green-100 text-green-500 border border-green-200`;
      default:
        return `bg-gray-100 text-gray-500 border border-gray-200`;
    }
  };
  return (
    <div className="overflow-x-auto rounded-lg p-0 mt-3">
      <table className="min-w-full">
        <thead>
          <tr className="text-left">
            <th className="px-4 py-3 font-medium text-[13px] text-gray-800 ">
              Name
            </th>
            <th className="px-4 py-3 font-medium text-[13px] text-gray-800 ">
              Status
            </th>
            <th className="px-4 py-3 font-medium text-[13px] text-gray-800 ">
              Piriority
            </th>
            <th className="px-4 py-3 font-medium text-[13px] text-gray-800 hidden md:table-cell">
              Created On
            </th>
          </tr>
        </thead>
        <tbody>
          {tableData?.map((task) => (
            <tr key={task?._id} className="border-t border-gray-200">
              <td className="my-3 mx-4  text-[13px] line-clamp-1 overflow-hidden">
                {task?.title}
              </td>
              <td className="py-4 px-4 ">
                <span
                  className={`px-2 py-1 text-xs rounded inline-block ${getStatusBadgeColor(
                    task?.status
                  )}`}
                >
                  {task?.status}
                </span>
              </td>
              <td className="py-4 px-4">
                <span
                  className={`px-2 py-1 text-xs rounded inline-block ${getPiriorityBadgeColor(
                    task?.piriority
                  )}`}
                >
                  {task?.piriority}
                </span>
              </td>
              <td className="py-4 px-4 text-gray-700 text-nowrap hidden md:table-cell text-[13px]">
                {task.createdAt
                  ? moment(task.createdAt).format("Do MMM YYYY ")
                  : "N/A"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TaskListTable;
