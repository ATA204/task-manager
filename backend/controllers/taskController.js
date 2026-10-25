const Task = require("../models/Task");
const { onTaskCreated, onTaskUpdated, onTaskDeleted, onTaskStatusChanged, onChecklistUpdated } = require("../services/notificationEvents");

const createTask = async (req, res) => {
  try {
    const {
      title,
      description,
      piriority,
      status,
      dueDate,
      assignedTo,
      createdBy,
      attachments,
      todoCheckList,
    } = req.body;

    if (!Array.isArray(assignedTo)) {
      return res
        .status(400)
        .json({ message: "assignedTo should be an array of IDs" });
    }

    const task = await Task.create({
      title,
      description,
      piriority,
      status,
      dueDate,
      assignedTo,
      createdBy: req.user._id,
      attachments,
      todoCheckList,
    });

    await onTaskCreated(task, req.user); //Notification (awaited: serverless stops work after the response)
    res.status(201).json({ message: "Task Created Successfully ", task });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "server error", error: error.message });
  }
};
const getTasks = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = {};
    if (status) {
      filter.status = status;
    }
    let tasks;
    if (req.user.role === "admin") {
      tasks = await Task.find(filter).populate(
        "assignedTo",
        "name email profileImageUrl",
      );
    } else {
      tasks = await Task.find({
        ...filter,
        assignedTo: { $in: [req.user._id] },
      }).populate("assignedTo", "name email profileImageUrl");
    }

    tasks = await Promise.all(
      tasks.map(async (task) => {
        const completedCount = task?.todoCheckList?.filter(
          (item) => item.completed,
        ).length;
        // console.log(`completed count ${completedCount}`);

        return { ...task._doc, completedCount: completedCount };
      }),
    );

    const [allTasks, pendingTasks, completedTasks, inProgressTasks] = await Promise.all([
      Task.countDocuments(
        req.user.role === "admin" ? {} : { assignedTo: { $in: req.user._id } }
      ),
      Task.countDocuments({
        ...filter,
        status: "Pending",
        ...(req.user.role !== "admin" && { assignedTo: { $in: req.user._id } })
      }),
      Task.countDocuments({
        ...filter,
        status: "Completed",
        ...(req.user.role !== "admin" && { assignedTo: { $in: [req.user._id] } })
      }),
       Task.countDocuments({
  ...filter,
  status: "In Progress",
  ...(req.user.role !== "admin" && { assignedTo: { $in: [req.user._id] } })
}),

    ])

res.json({
  tasks,
  statusSummary: {
    allTasks,
    pendingTasks,
    completedTasks,
    inProgressTasks,
  },
});
  } catch (error) {
  return res
    .status(500)
    .json({ message: "Server error", error: error.message });
}
};

const findTaskById = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id).populate(
      "assignedTo",
      "name email profileImageUrl",
    );
    if (!task) {
      return res.status(404).json({ message: "Task Not found" });
    }
    res.json({
      task,
    });
  } catch (error) {
    console.error({
      message: "error fetching task by ID",
      error: error.message,
    });
  }
};
const upadtaTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: "Task Not Found" });
    }
    const before = task.toObject()
    task.title = req.body.title || task.title;
    task.description = req.body.description || task.description;
    task.piriority = req.body.piriority || task.piriority;
    task.dueDate = req.body.dueDate || task.dueDate;
    task.attachments = req.body.attachments || task.attachments;
    task.todoCheckList = req.body.todoCheckList || task.todoCheckList;
    if (!Array.isArray(req.body.assignedTo)) {
      return res
        .status(400)
        .json({ message: "assignedTo must be array of User's IDs" });
    }
    task.assignedTo = req.body.assignedTo || task.assignedTo;

    const updatedTask = await task.save();
    await onTaskUpdated(updatedTask, before, req.user) //Notification
    res.status(200).json({ message: "Task Updated Successfully", updatedTask });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "server error", error: error.message });
  }
};

const deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: "Task Not Found" });
    }

    await task.deleteOne();
    await onTaskDeleted(task, req.user); //Notification
    res.json({ message: "Task Deleted Successfully" });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};
const updateTaskStatus = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: "Task Not Found" })
    }
    const isAssigned = task.assignedTo.some(
      (userId) => userId.toString() === req.user._id.toString(),
    );
    if (!isAssigned && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not Authorized" });
    }

    const oldStatus = task.status;

    task.status = req.body.status || task.status;

    if (task.status === "Completed") {
      task.todoCheckList.forEach((item) => (item.completed = true));
      task.progress = 100;
    }
    await task.save();
    await onTaskStatusChanged(oldStatus, task, req.user)
    res.json({ message: "Stauts Updated", task });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

const updateTaskChecklist = async (req, res) => {
  try {
    const { todoCheckList, todoChecklist } = req.body;
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: "Task Not Found" });
    }

    const isAssignedUser = task.assignedTo.some(
      (userId) => userId.toString() === req.user._id.toString(),
    );

    if (!isAssignedUser && req.user.role !== "admin") {
      return res
        .status(403)
        .json({ message: "Not Authorized to Update Checklist" });
    }

    const nextTodoCheckList = Array.isArray(todoCheckList)
      ? todoCheckList
      : Array.isArray(todoChecklist)
        ? todoChecklist
        : null;

    if (!nextTodoCheckList) {
      return res.status(400).json({ message: "todoCheckList is required" });
    }
    const before = { status: task.status, progress: task.progress }
    task.todoCheckList = nextTodoCheckList;
    const completedItems = task?.todoCheckList.filter(
      (item) => item.completed,
    ).length;
    const totalItems = task.todoCheckList.length;
    task.progress =
      totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;
    if (task.progress === 100) {
      task.status = "Completed";
    } else if (task.progress > 0) {
      task.status = "In Progress";
    } else {
      task.status = "Pending";
    }
    await task.save();
    await onChecklistUpdated(task, before, req.user);
    const updatedTask = await Task.findById(req.params.id).populate(
      "assignedTo",
      "name email profileImageUrl",
    );
    res.json({ message: "Task Checklist Updated", task: updatedTask });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};
const getDashboardData = async (req, res) => {
  try {
    //fetch statistics
    const [totalTasks, pendingTasks, completedTasks, overDueTasks] = await Promise.all([
      Task.countDocuments(),
      Task.countDocuments({ status: "Pending" }),
      Task.countDocuments({ status: "Completed" }),
      Task.countDocuments({
        status: { $ne: "Completed" },
        dueDate: { $lt: new Date() }
      })
    ])
    // const totalTasks = await Task.countDocuments();
    // const pendingTasks = await Task.countDocuments({ status: "Pending" });
    // const completedTasks = await Task.countDocuments({ status: "Completed" });
    // const overDueTasks = await Task.countDocuments({
    //   status: { $ne: "Completed" },
    //   dueDate: { $lt: new Date() },
    // });

    const taskStatuses = ["Pending", "Completed", "In Progress"];
    const taskDistributionRaw = await Task.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);
    const taskDistribution = taskStatuses.reduce((acc, status) => {
      const formatedKey = status.replace(/\s+/g, "");
      acc[formatedKey] =
        taskDistributionRaw.find((item) => item._id === status)?.count || 0;
      return acc;
    }, {});
    taskDistribution["All"] = totalTasks;

    const piriorities = ["Low", "Medium", "High"];
    const taskPirioritiesRaw = await Task.aggregate([
      {
        $group: {
          _id: "$piriority",
          count: { $sum: 1 },
        },
      },
    ]);
    const taskPiriorityLevels = piriorities.reduce((acc, piriority) => {
      acc[piriority] =
        taskPirioritiesRaw.find((item) => item._id === piriority)?.count || 0;
      return acc;
    }, {});
    const recentTasks = await Task.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .select("title status piriority dueDate createdAt");

    res.status(200).json({
      statistics: {
        totalTasks,
        pendingTasks,
        completedTasks,
        overDueTasks,
      },
      charts: {
        taskDistribution,
        taskPiriorityLevels,
      },
      recentTasks,
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};
const getUserDashboard = async (req, res) => {
  try {
    const userId = req.user._id;
    const totalTasks = await Task.countDocuments({ assignedTo: userId });
    const pendingTasks = await Task.countDocuments({
      status: "Pending",
      assignedTo: userId,
    });
    const completedTasks = await Task.countDocuments({
      status: "Completed",
      assignedTo: userId,
    });
    const overDueTasks = await Task.countDocuments({
      assignedTo: userId,
      status: { $ne: "Completed" },
      dueDate: { $lt: new Date() },
    });

    const taskStatuses = ["Pending", "In Progress", "Completed"];
    const taskDistributionRaw = await Task.aggregate([
      {
        $match: { assignedTo: { $in: [userId] } },
      },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);
    const taskDistribution = taskStatuses.reduce((acc, status) => {
      const formatedKey = status.replace(/\s+/g, "");
      acc[formatedKey] =
        taskDistributionRaw.find((item) => item._id === status)?.count || 0;
      return acc;
    }, {});
    taskDistribution["All"] = totalTasks;

    const piriorities = ["Low", "Medium", "High"];
    const taskPirioritiesRaw = await Task.aggregate([
      { $match: { assignedTo: userId } },
      {
        $group: {
          _id: "$piriority",
          count: { $sum: 1 },
        },
      },
    ]);

    const taskPiriorityLevels = piriorities.reduce((acc, piriority) => {
      acc[piriority] =
        taskPirioritiesRaw.find((item) => item._id === piriority)?.count || 0;
      return acc;
    }, {});

    const recentTasks = await Task.find({ assignedTo: userId })
      .sort({ createdAt: 1 })
      .limit(10)
      .select("title status piriority dueDate createdAt");

    res.status(200).json({
      statistics: {
        totalTasks,
        pendingTasks,
        completedTasks,
        overDueTasks,
      },
      charts: {
        taskDistribution,
        taskPiriorityLevels,
      },
      recentTasks,
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};
module.exports = {
  createTask,
  getTasks,
  findTaskById,
  upadtaTask,
  deleteTask,
  updateTaskStatus,
  updateTaskChecklist,
  getDashboardData,
  getUserDashboard,
};
