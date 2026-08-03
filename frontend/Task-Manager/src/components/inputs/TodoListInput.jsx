import React, { useState } from "react";
import { HiOutlineTrash  } from "react-icons/hi";
import { HiMiniPlus  } from "react-icons/hi2";

const TodoListInput = ({ todolist, setTodolist }) => {
  const [option, setOption] = useState("");
  
  const handleAddOption = () => {
    if (option.trim()) {
      setTodolist([...todolist, option.trim()]);
      setOption("")
    }
  };

  const handleDeleteOption = (index) => {
    const updatedArr = todolist.filter((_, idx) => idx !== index);
    setTodolist(updatedArr);
  };
  return (
    <div>
      {todolist?.map((item, index) => (
        <div key={index} className="flex justify-between bg-gray-50 border border-gray-100 px-3 py-2 mb-3 mt-2 rounded-md">
          <p className="text-xs text-black">
            <span className="text-xs text-gray-400  font-semibold  mr-2">
                {index<9?`0${index+1}`:index+1}
            </span>
            {item}
          </p>
          <button
          type="button"
          className="cursor-pointer"
          onClick={()=>handleDeleteOption(index)}
          >

            <HiOutlineTrash
            className="text-red-500 text-lg"
            />
          </button>
        </div>
      ))}
      <div className="flex items-center gap-5 mt-4">
        <input type="text"
        className="w-full text-[13px] text-black outline-none bg-white border border-gray-100 px-3 py-2 rounded-md"
        placeholder="Enter Task"
        value={option}
        onChange={({target})=>setOption(target.value)}
        />
        <button
        type="button"
        onClick={handleAddOption}
        className="card-btn text-nowrap"
        >
         <HiMiniPlus className="text-lg"/>

             Add</button>
      </div>
    </div>
  );
};

export default TodoListInput;
