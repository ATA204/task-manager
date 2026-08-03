import React from "react";
import Auth_Img from "../../assets/Images/Auth_Img.png";
const AuthLayout = ({ children }) => {
  return (
    <div className="flex justify-between ">
      <div className="w-screen h-screen md:w-[60vw] px-12 pt-8 tb-12">
        <h2 className="text-lg font-medium text-black">Task Manager</h2>
        {children}
      </div>
      <div className="hidden md:flex w-[40vw] h-screen justify-center items-center bg-blue-50 bg-cover">
      <img className="w-64 lg:w-[90%]" src={Auth_Img} alt="" />
      </div>
    </div>
  );
};

export default AuthLayout;
