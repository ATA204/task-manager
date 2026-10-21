import { useContext, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Outlet, Navigate } from "react-router-dom";
import Login from "./pages/Auth/Login";
import SignUp from "./pages/Auth/SignUp";
import PrivateRoute from "./routes/PrivateRoute";
import Dashboard from "./pages/Admin/Dashboard";
import CreateTask from "./pages/Admin/CreateTask";
import ManageTasks from "./pages/Admin/ManageTasks";
import ManageUsers from "./pages/Admin/ManageUsers";
import UserDashboard from "./pages/User/UserDashboard";
import MyTasks from "./pages/User/MyTasks";
import ViewTaskDetails from "./pages/User/ViewTaskDetails";
import UserProvider, { UserContext } from "./context/UserContext";
import {Toaster} from 'react-hot-toast'
import NotificationProvider from "./context/NotificationContext";

function App() {
  return (
    <UserProvider>
      <NotificationProvider> 
    <div>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          {/* Admin routes */}
          <Route element={<PrivateRoute allowedRoles={["admin"]} />}>
            <Route path="/admin/dashboard" element={<Dashboard />} />
            <Route path="/admin/create-task" element={<CreateTask />} />
            <Route path="/admin/tasks" element={<ManageTasks />} />
            <Route path="/admin/users" element={<ManageUsers />} />
          </Route>
          {/* User routes */}
          <Route element={<PrivateRoute allowedRoles={["member"]} />}>
            <Route path="/user/dashboard" element={<UserDashboard />} />
            <Route path="/user/tasks" element={<MyTasks />} />
            <Route path="/user/tasks/:id" element={<ViewTaskDetails />} />
          </Route>

          <Route path="/" element={<Root/>}/>
        </Routes>
      </Router>
    </div>
    <Toaster
    toastOptions={{
      style:{
        fontSize:"13px"
      },
    }}
    />
    </NotificationProvider>
    </UserProvider>
  );
}

export default App;
 const Root=()=>{
   const {loadingUser, user}=useContext(UserContext)
   if(loadingUser) return <Outlet/>
   if(!user){
     return <Navigate to='/login'/>
   }

   return user.role==="admin"?<Navigate to="/admin/dashboard"/>:<Navigate to="/user/dashboard"/>
 }
