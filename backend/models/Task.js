const mongoose = require("mongoose");

const todoSchema = mongoose.Schema({
    text: {
        type: String,
        required: true
    },
    completed: {
        type: Boolean,
        default: false
    }
})

const taskSchema = mongoose.Schema({
    title: {
        type: String,
        required: true,

    },
    description: {
        type: String,
    },
    piriority: {
        type: String,
        enum: ["Low", "Medium", "High"],
        default: "Medium"
    },
    status: {
        type: String,
        enum: ["Pending", "In Progress", "Completed"],
        default: "Pending"
    },
    dueDate: {
        type: Date,
        required: true
    },
    assignedTo: {
        type: [mongoose.Types.ObjectId],
        ref: "User"
    },
    createdBy: {
        type: mongoose.Types.ObjectId,
        ref: "User"
    },
    attachments: {
        type: [String]
    },
    todoCheckList: [todoSchema],
    progress: {
        type: Number,
        default: 0
    },
    reminders: {
        dueSoonSentFor: { type: Date, default: null },
        overdueSentFor: { type: Date, default: null },
    }



},
    { timestamps: true }
)

module.exports = mongoose.model("Task", taskSchema)