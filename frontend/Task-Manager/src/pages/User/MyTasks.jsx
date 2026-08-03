import React, { useEffect, useState } from "react";
import DashboardLayout from "../../components/layouts/DashboardLayout";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../utils/axiosinstance";
import { API_PATHS } from "../../utils/apiPaths";
import { LuFileSpreadsheet } from "react-icons/lu";
import TaskStatusTabs from "../../components/TaskStatusTabs";
import TaskCard from "../../components/Cards/TaskCard";
import toast from "react-hot-toast";

const MyTasks = () => {
  const [allTasks, setAllTasks] = useState();
  const [tabs, setTabs] = useState([]);
  const [filterStatus, setFilterStatus] = useState("All");

  const navigate = useNavigate();

  const getAllTasks = async () => {
    try {
      const response = await axiosInstance.get(API_PATHS.TASKS.GET_ALL_TASKS, {
        params: {
          status: filterStatus === "All" ? "" : filterStatus,
        },
      });

      setAllTasks(response.data?.tasks?.length > 0 ? response.data?.tasks : []);
      const statusSummary = response.data.statusSummary || [];
      const statusArr = [
        { label: "All", count: statusSummary.allTasks || 0 },
        { label: "Pending", count: statusSummary.pendingTasks || 0 },
        { label: "In Progress", count: statusSummary.inProgressTasks || 0 },
        { label: "Completed", count: statusSummary.completedTasks || 0 },
      ];
      setTabs(statusArr);
      // console.log(response.data.tasks);
    } catch (error) {
      console.error("Error fetching Tasks", error);
    }
  };
  const handleClick = (taskId) => {
    navigate(`/user/tasks/${taskId}`);
  };


  useEffect(() => {
    getAllTasks(filterStatus);
    // console.log(allTasks?.map((item) => item.progress));

    return () => {};
  }, [filterStatus]);

  return (
    <DashboardLayout activeMenu="My Tasks">
      <div className="my-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between ">
            <h2 className="text-xl font-medium ">My Tasks</h2>
       
          {tabs?.[0]?.count && (
              <TaskStatusTabs
                tabs={tabs}
                activeTab={filterStatus}
                setActiveTab={setFilterStatus}
              />
         
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          {allTasks?.map((item, index) => {
            return (
              <TaskCard
                key={item._id}
                title={item.title}
                description={item.description}
                piriority={item.piriority}
                status={item.status}
                progress={item.progress}
                createdAt={item.createdAt}
                dueDate={item.dueDate}
                assignedTo={item.assignedTo.map((item) => item.profileImageUrl)}
                attachmentCount={item.attachments.length || 0}
                completedTodoCount={item.completedCount}
                todoChecklist={item.todoCheckList || []}
                onClick={() => handleClick(item._id)}
              />
            );
          })}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default MyTasks;
