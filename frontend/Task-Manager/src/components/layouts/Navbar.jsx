import React, { useState } from "react";
import { HiOutlineX, HiOutlineMenu } from "react-icons/hi";
import SideMenu from "./SideMenu";
import NotificationBell from "../notifications/NotificationBell";

const Navbar = ({ activeMenu }) => {
  const [openSideMenu, setOpenSideMenu] = useState(false);
  return (
    <div className="relative z-30 flex gap-5 bg-white border border-gray-200/50 backdrop-blur-[2px] py-4 ">
      <button
        className="block lg:hidden text-black"
        onClick={() => {
          setOpenSideMenu(!openSideMenu);
        }}
      >
        {openSideMenu ? (
          <HiOutlineX className="text-2xl cursor-pointer" />
        ) : (
          <HiOutlineMenu className="text-2xl cursor-pointer" />
        )}
      </button>
      <h2 className="text-lg font-medium text-black px-0.5">Task Manager</h2>
      <div className="ml-auto mr-5">
        <NotificationBell/>
      </div>

      {openSideMenu && (
        <div className="fixed top-[61px] -ml-4 bg-white">
          <SideMenu activeMenu={activeMenu} />
        </div>
      )}
    </div>
  );
};

export default Navbar;
