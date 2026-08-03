const express = require("express");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const Task = require("../models/Task");

const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({ role: "member" }).select("-password");
    const usersWithTasks = await Promise.all(
      users.map(async (user) => {
        const pendingTasks = await Task.countDocuments({
          assignedTo: { $in: [user._id] },
          status: "Pending",
        });
        const inProgressTasks = await Task.countDocuments({
          assignedTo: { $in: [user._id] },
          status: "In Progress",
        });
        const completedTasks = await Task.countDocuments({
          assignedTo: { $in: [user._id] },
          status: "Completed",
        });
        return {
          ...user._doc,
          pendingTasks,
          inProgressTasks,
          completedTasks,
        };
      })
    );
    res.json( usersWithTasks );
  } catch (error) {
    return res
      .status(500)
      .json({ message: "server error", error: error.message });
  }
};

const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if(!user){
        return res.status(404).json({message:"Not Found User"})
    }
    const pendingTasks = await Task.countDocuments({
      assignedTo: { $in: [user._id] },
      status: "Pending",
    });
    const inProgressTasks = await Task.countDocuments({
      assignedTo: { $in: [user._id] },
      status: "In Progress",
    });
    const completedTasks = await Task.countDocuments({
      assignedTo: { $in: [user._id] },
      status: "Completed",
    });
    res.json({
        ...user._doc,
        pendingTasks,
        inProgressTasks,
        completedTasks
    })
  } catch (error) {
    return res
      .status(500)
      .json({ message: "server error", error: error.message });
  }
};

module.exports = { getAllUsers,getUserById };
