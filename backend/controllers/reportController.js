const Task = require("../models/Task");
const User = require("../models/User");
const excelJS = require("exceljs");

const getTasksReport = async (req, res) => {
  try {
    const tasks = await Task.find().populate("assignedTo", "name email");

    const workbook = new excelJS.Workbook();
    const worksheet = workbook.addWorksheet("Tasks Report");
    worksheet.columns = [
      { header: "Task ID", key: "_id", width: 25 },
      { header: "Title", key: "title", width: 30 },
      { header: "Description", key: "description", width: 50 },
      { header: "Priority", key: "piriority", width: 15 },
      { header: "Status", key: "status", width: 20 },
      { header: "Due Date", key: "dueDate", width: 20 },
      { header: "Assigned to", key: "assignedTo", width: 30 },
    ];
    tasks.forEach((task) => {
      const assignedTo = task.assignedTo
        .map((user) => `${user.name} (${user.email})`)
        .join(", ");
      worksheet.addRow({
        _id: task._id,
        title: task.title,
        description: task.description,
        piriority: task.piriority,
        status: task.status,
        dueDate: task.dueDate,
        assignedTo: assignedTo || "UnAssigned",
      });
    });

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheet.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      "attachment; filename='tasks_report.xlsx'"
    );
    return workbook.xlsx.write(res).then(() => {
      res.end();
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Can't Export Tasks", error: error.message });
  }
};
const getUsersReport = async (req, res) => {
  try {
    const users = await User.find({}, "name email _id");
    const userTasks = await Task.find().populate(
      "assignedTo",
      "name email _id"
    );

    const userTasksMap = {};
    users.forEach((user) => {
      userTasksMap[user._id] = {
        name: user.name,
        email: user.email,
        tasksCount: 0,
        pendingTasks: 0,
        inProgressTasks: 0,
        completedTasks: 0,
      };
    });
    userTasks.forEach((task) => {
      const assignedUsers = Array.isArray(task.assignedTo)
        ? task.assignedTo
        : task.assignedTo
        ? [task.assignedTo]
        : [];

      assignedUsers.forEach((assignedUser) => {
        if (userTasksMap[assignedUser._id]) {
          userTasksMap[assignedUser._id].tasksCount += 1;
          const status = String(task.status || "").trim().toLowerCase();
          if (status === "pending") {
            userTasksMap[assignedUser._id].pendingTasks += 1;
          } else if (status === "completed") {
            userTasksMap[assignedUser._id].completedTasks += 1;
          } else if (status === "in progress") {
            userTasksMap[assignedUser._id].inProgressTasks += 1;
          }
        }
      });
    });
    const workbook = new excelJS.Workbook();
    const worksheet = workbook.addWorksheet("User Tasks Report");
    worksheet.columns = [
      { header: "User Name", key: "name", width: 20 },
      { header: "Email", key: "email", width: 30 },
      { header: "Total Assigned Tasks", key: "tasksCount", width: 20 },
      { header: "Pending Tasks", key: "pendingTasks", width: 20 },
      { header: "In Progress Tasks", key: "inProgressTasks", width: 20 },
      { header: "Completed Tasks", key: "completedTasks", width: 20 },
    ];

    Object.values(userTasksMap).forEach((user) => {
      worksheet.addRow(user);
    });

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheet.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      "attachment; filename='users_report.xlsx'"
    );
    return workbook.xlsx.write(res).then(() => {
      res.end();
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "can't get User report", error: error.message });
  }
};

module.exports = { getTasksReport,getUsersReport };
