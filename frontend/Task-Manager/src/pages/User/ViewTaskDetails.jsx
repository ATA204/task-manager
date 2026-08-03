import React, { useEffect, useState } from "react";
import DashboardLayout from "../../components/layouts/DashboardLayout";
import { useParams } from "react-router-dom";
import axiosInstance from "../../utils/axiosinstance";
import { API_PATHS } from "../../utils/apiPaths";
import moment from "moment";
import AvatarGroup from "./../../components/layouts/AvatarGroup";
import { LuSquareArrowOutUpRight } from "react-icons/lu";

const ViewTaskDetails = () => {
  const [task, setTask] = useState(null);
  const { id } = useParams();

  const getStatusColor = (status) => {
    switch (status) {
      case "In Progress":
        return "text-cyan-500 bg-cyan-50 border border-cyan-500/10";
      case "Completed":
        return "text-lime-500 bg-lime-50 border border-lime-500/20";
      default:
        return "text-violet-500 bg-violet-50 border border-violet-500/10";
    }
  };

  const getTaskDetails = async () => {
    try {
      const response = await axiosInstance.get(
        API_PATHS.TASKS.GET_TASK_BY_ID(id),
      );
      if (response.data?.task) {
        const taskInfo = response.data.task;
        setTask(taskInfo);
        // console.log(taskInfo);
      }
    } catch (error) {
      console.error("error fetching task", error);
    }
  };

  const updateTodoChecklist = async (index) => {
    if (!task?.todoCheckList) return;

    const taskId = id;
    const previousChecklist = task.todoCheckList;
    const updatedChecklist = task.todoCheckList.map((item, itemIndex) =>
      itemIndex === index ? { ...item, completed: !item.completed } : item,
    );

    setTask((prevTask) =>
      prevTask ? { ...prevTask, todoCheckList: updatedChecklist } : prevTask,
    );

    try {
      const response = await axiosInstance.put(
        API_PATHS.TASKS.UPDATE_TASK_TODOCHECKLIST(taskId),
        { todoCheckList: updatedChecklist },
      );

      if (response.status === 200 && response.data?.task) {
        setTask(response.data.task);
      } else {
        setTask((prevTask) =>
          prevTask ? { ...prevTask, todoCheckList: previousChecklist } : prevTask,
        );
      }
    } catch (error) {
      setTask((prevTask) =>
        prevTask ? { ...prevTask, todoCheckList: previousChecklist } : prevTask,
      );
      console.error("error updating todo checklist", error);
    }
  };
  const handleLinkClick = (link) => {
    if (!/^https?:\/\//i.test(link)) {
      link = "https://" + link;
    }
    window.open(link, "_blank");
  };

  useEffect(() => {
    getTaskDetails();
    // console.log(id);

    return () => {};
  }, [id]);

  return (
    <DashboardLayout activeMenu="My Tasks">
      <div className="mt-5">
        {task && (
          <div className="grid grid-cols-1 md:grid-cols-4 mt-4">
            <div className="form-card col-span-3">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-medium">{task?.title}</h2>
                <div
                  className={`text-[13px] font-medium ${getStatusColor(task?.status)} px-4 py-0.5 rounded`}
                >
                  {task?.status}
                </div>
              </div>
              <div className="mt-4">
                <InfoBox label="Description" value={task?.description} />
              </div>
              <div className="grid grid-cols-12 mt-4 gap-4">
                <div className="col-span-6 md:col-span-4">
                  <InfoBox label="Piriority" value={task?.piriority} />
                </div>
                <div className="col-span-6 md:col-span-4">
                  <InfoBox
                    label="Due Date"
                    value={
                      task?.dueDate
                        ? moment(task?.dueDate).format("Do MMMM YYYY")
                        : "N/A"
                    }
                  />
                </div>
                <div className="col-span-6 md:col-span-4">
                  <label className="text-xs font-medium text-slate-500">
                    Assigned To
                  </label>
                  <AvatarGroup
                    maxVisible={5}
                    avatars={task?.assignedTo.map(
                      (item) => item.profileImageUrl || [],
                    )}
                  />
                </div>
              </div>
              <div className="mt-2">
                <label className="text-xs font-medium text-slate-500">
                  Todo Checklist
                </label>
                {task?.todoCheckList?.map((item, index) => (
                  <TodoChecklist
                    key={`todo_${index}`}
                    text={item.text}
                    isChecked={item.completed}
                    onChange={() => updateTodoChecklist(index)}
                  />
                ))}
              </div>

              {task?.attachments?.length > 0 && (
                <div>
                  <label className="text-xs font-medium text-slate-500">
                    Attachments
                  </label>
                  {task?.attachments.map((link, index) => (
                    <Attachment
                      key={`index_${index}`}
                      index={index}
                      link={link}
                      onClick={() => handleLinkClick(link)}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default ViewTaskDetails;

const InfoBox = ({ label, value }) => {
  return (
    <>
      <label className="text-xs font-medium text-slate-500">{label}</label>
      <p className="text-[12px] md:text-[13px] text-gray-700 mt-0.5 font-medium">
        {value}
      </p>
    </>
  );
};

const TodoChecklist = ({ text, isChecked, onChange }) => {
  return (
    <>
      <div className="flex items-center gap-3 p-3 ">
        <input
          type="checkbox"
          onChange={onChange}
          checked={isChecked}
          className="w-4 h-4 rounded-sm text-primary bg-gray-100 border border-gray-300 outline-none cursor-pointer"
        />
        <p className="text-[13px] text-gray-800">{text}</p>
      </div>
    </>
  );
};
const Attachment = ({ index, link, onClick }) => {
  return (
    <>
      <div
        className="flex items-center justify-between bg-gray-50 border border-gray-100 px-3 py-2 rounded-md mt-3 mb-2 cursor-pointer"
        onClick={onClick}
      >
        <div className="flex-1 flex items-center gap-3">
          <span className="text-xs text-gray-400 font-semibold mr-2">
            {index < 9 ? `0${index + 1}` : `${index + 1}`}
          </span>
          <p className="text-xs text-black">{link}</p>
        </div>
        <LuSquareArrowOutUpRight className="text-gray-400" />
      </div>
    </>
  );
};
