import React, { useContext, useEffect, useState } from "react";
import DashboardLayout from "../../components/layouts/DashboardLayout";
import { useUserAuth } from "./../../hooks/useUserAuth";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../utils/axiosinstance";
import { API_PATHS } from "../../utils/apiPaths";
import { UserContext } from "../../context/UserContext";
import moment from "moment";
import InfoCard from "../../components/Cards/InfoCard";
import { addThousandsSeparator } from "../../utils/helper";
import { LuArrowRight } from "react-icons/lu";
import TaskListTable from "../../components/TaskListTable";
import CustomPieChart from "../../components/Charts/CustomPieChart";
import CustomBarChart from "../../components/Charts/CustomBarChart";

const UserDashboard = () => {
  const COLORS = ["#8D51FF", "#00B8DB", "#7BCE00 "];
  useUserAuth();
  const { user } = useContext(UserContext);
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState(null);
  const [pieChartData, setPieChartData] = useState([]);
  const [barChartData, setBarChartData] = useState([]);

  const prepareChartsData = (data) => {
    const taskDistribution = data?.taskDistribution || null;
    const taskPiriorityLevels =
      data?.taskPiriorityLevels || data?.taskPirioritiesLevels || null;

    const taskDistributionData = [
      { status: "Pending", count: taskDistribution?.Pending },
      { status: "In Progress", count: taskDistribution?.InProgress },
      { status: "Completed", count: taskDistribution?.Completed },
    ];
    setPieChartData(taskDistributionData);
    const taskPiriorityLevelsData = [
      { piriority: "Low", count: taskPiriorityLevels?.Low },
      { piriority: "Medium", count: taskPiriorityLevels?.Medium },
      { piriority: "High", count: taskPiriorityLevels?.High },
    ];
    setBarChartData(taskPiriorityLevelsData);
  };

  const onSeeMore = () => {
    navigate("/user/tasks");
  };
  const getDashboardData = async () => {
    try {
      const response = await axiosInstance.get(
        API_PATHS.TASKS.GET_USER_DASHBOARD_DATA
      );
      setDashboardData(response.data);
      prepareChartsData(response.data?.charts || null);
    } catch (error) {
      console.error("Error fetching users", error);
    }
  };
  useEffect(() => {
    getDashboardData();

    return () => {};
  }, []);

  return (
    <DashboardLayout activeMenu="Dashboard">
      <div className="card my-5">
        <div>
          <div className="col-span-3">
            <h2 className="text-xl md:text-2xl ">Good Morning! {user?.name}</h2>
            <p className="text-xs md:text-[13px] text-gray-400 mt-1.5">
              {moment().format("dddd Do MMM YYYY")}
            </p>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 sm:grid-cols-2 mt-5 ">
          <InfoCard
            label="Total Tasks"
            value={addThousandsSeparator(
              dashboardData?.charts?.taskDistribution?.All || 0
            )}
            color="bg-primary"
          />
          <InfoCard
            label="Pending Tasks"
            value={addThousandsSeparator(
              dashboardData?.charts?.taskDistribution?.Pending || 0
            )}
            color="bg-violet-500"
          />
          <InfoCard
            label="In Progress Tasks"
            value={addThousandsSeparator(
              dashboardData?.charts?.taskDistribution?.InProgress || 0
            )}
            color="bg-cyan-500"
          />
          <InfoCard
            label="Completed Tasks"
            value={addThousandsSeparator(
              dashboardData?.charts?.taskDistribution?.Completed || 0
            )}
            color="bg-lime-500"
          />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-4 md:my-6">
        <div>
          <div className="card">
            <div className="flex justify-between items-center ">
              <h5 className="font-medium">Task Distribution</h5>
            </div>
            <CustomPieChart data={pieChartData} colors={COLORS} />
          </div>
        </div>
        <div>
          <div className="card">
            <div className="flex justify-between items-center ">
              <h5 className="font-medium">Task Piriority Levels</h5>
            </div>
            <CustomBarChart data={barChartData} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-4 md:my-6">
        <div className="md:col-span-2">
          <div className="card">
            <div
              className="flex items-center justify-between
    "
            >
              <h5 className="text-lg">Recent Tasks</h5>
              <button className="card-btn" onClick={() => onSeeMore()}>
                See All
                <LuArrowRight className="text-base" />
              </button>
            </div>
            <TaskListTable tableData={dashboardData?.recentTasks || null} />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default UserDashboard;
