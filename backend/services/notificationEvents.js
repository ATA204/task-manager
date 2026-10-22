const { NOTIFICATION_TYPES } = require("../utils/notificationTypes");
const { notify, notifyAdmins } = require("./notificationService");

const idStrings = (list = []) => list.map((item) => (item._id || item).toString())

const peopleOnTask = (task) => [task.createdBy, ...task.assignedTo];

const checklistKey = (list = []) => JSON.stringify(list.map((item) => [item.text, item.completed]));

const chooseRecepients = (allPeople = [], actor) => {
    const actorId = String(actor?._id || actor);
    return [...new Set(allPeople)].map((id) => String(id._id || id)).filter((id) => id?._id !== actorId)

}
const safe = (fn) => async (...args) => {
    try {
        await fn(...args);
    }
    catch (error) {
        console.error({ message: `[notification] ${fn.name} failed`, error: error.message })
    }
}

const taskCreated = async (task, actor) => {
    await notify(
        {
            recipients: task.assignedTo,
            actor,
            type: NOTIFICATION_TYPES.TASK_ASSIGNED,
            message: `${actor.name} assigned you ${task?.title}`,
            title: "New Task assigned",
            task: task._id,
            meta: { dueDate: task.dueDate, piriority: task.piriority },
        }
    );
};

const taskUpdated = async (task, before, actor) => {
    const oldIds = idStrings(before.assignedTo);
    const newIds = idStrings(task.assignedTo);
    const added = [...newIds].filter((id) => !oldIds.includes(id));
    const removed = [...oldIds].filter((id) => !newIds.includes(id));
    const stayed = [...oldIds].filter((id) => newIds.includes(id));

    const changes = [];

    if (before.title !== task.title) changes.push("title");
    if (before.decription !== task.description) changes.push("description");
    if (before.piriority !== task.piriority) changes.push("piriority");
    if (new Date(before.dueDate).getTime() !== new Date(task.dueDate).getTime()) changes.push("due Date")
    if (checklistKey(before.todoChecklist) !== checklistKey(task.todoChecklist)) changes.push("checklist")

    if (added.length > 0) {
        await notify({
            recipients: added,
            type: NOTIFICATION_TYPES.TASK_ASSIGNED,
            actor,
            title: "New Task assigned",
            message: `${actor.name} assigned you ${task.title}`,
            task: task._id
        })

    }
    if (removed.length > 0) {
        await notify({
            recipients: removed,
            type: NOTIFICATION_TYPES.TASK_UNASSIGNED,
            actor,
            title: "Removed from a Task",
            message: `${actor.name} remved you from ${task.title}`,
            meta: { taskTitle: task.title }
        })

    }


}

const taskDeleted = async (task, actor) => {
    const recipients = chooseRecepients(peopleOnTask(task), actor)
    if (recipients.length === 0) return;

    await notify({
        recipients,
        actor,
        type: NOTIFICATION_TYPES.TASK_DELETED,
        title: "Task Deleted",
        message: `${actor.name} deleted ${task.title}`,
        meta: { taskTitle: task.title },

    });
};

const taskStatusChanged = async (oldStatus, task, actor) => {
    if (oldStatus === task.status) return; //Nothing changed

    const completed = task.status === "Completed";
    const recipients = chooseRecepients(peopleOnTask(task), actor)


    await notify({
        recipients,
        actor,
        type: completed ? NOTIFICATION_TYPES.TASK_COMPLETED : NOTIFICATION_TYPES.TASK_STATUS_CHANGED,
        title: completed ? `Task Completed` : "Task status changed",
        message: completed ? `${actor.name} completed ${task.title}`
            : `${actor.name} moved${task.title} from ${oldStatus} to ${task.status}`,
        task: task._id,
        meta: { from: oldStatus, to: task.status },

    });
};

const checklistUpdated = async (task, before, actor) => {
    if (before.progress === task.progress) return;

    if (before.status !== task.status) {
        return taskStatusChanged(before.status, task, actor)
    }
    const recipients = chooseRecepients(peopleOnTask(task), actor);
    await notify({
        recipients,
        actor,
        type: NOTIFICATION_TYPES.TASK_CHECKLIST_UPDATED,
        message: `${actor.name} updated the checklist of ${task.title} (${task.progress}% acheived)`,
        title: "Checklist updated",
        task: task._id,
        meta: { progress: task.progress },
    });
};
const taskDueSoon = async (task) => {
    await notify({
        recipients: task.assignedTo,
        message: `${task.title} is due in less than 24 hours`,
        type: NOTIFICATION_TYPES.TASK_DUE_SOON,
        title: "Task due soon",
        task: task._id,
        meta: { dueDate: task.dueDate },
    });
};
const taskoverDue = async (task) => {
    await notify({
        recipients: peopleOnTask(task),
        message: `${task.title} is overdue and still ${task.status}`,
        title: "Task overdue",
        type: NOTIFICATION_TYPES.TASK_OVERDUE,
        task: task._id,
        meta: { dueDate: task.dueDate }
    })
}
const userRegistered = async (user) => {
    await notifyAdmins({
        actor: user,
        type: NOTIFICATION_TYPES.USER_REGISTERED,
        title: "New team member",
        message: `${user.name} (${user.email}) joined as ${user.role}`,
        meta: { newUserId: user._id },
    });
};

module.exports = {
    onTaskCreated: safe(taskCreated),
    onTaskUpdated: safe(taskUpdated),
    onTaskDeleted: safe(taskDeleted),
    onTaskStatusChanged: safe(taskStatusChanged),
    onChecklistUpdated: safe(checklistUpdated),
    onTaskDueSoon: safe(taskDueSoon),
    onTaskOverdue: safe(taskoverDue),
    onUserRegistered: safe(userRegistered),
};