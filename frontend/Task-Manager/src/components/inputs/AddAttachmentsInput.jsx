import React, { useState } from "react";
import { HiOutlineTrash } from "react-icons/hi";
import { HiMiniPlus } from "react-icons/hi2";
import { LuPaperclip } from "react-icons/lu";



const AddAttachmentsInput = ({ attachments, setAttachments }) => {
  const [option, setOption] = useState("");
  const handleAddOption = () => {
    if (option.trim()) {
      setAttachments([...attachments, option.trim()]);
      setOption("")
    }

  };
  const handleDeleteOption=(index)=>{
    const updatedArr=attachments.filter((_,idx)=>idx!==index)
    setAttachments(updatedArr)
  }
  return <div>
{attachments.map((item,index)=>(
<div
key={index}
className="flex items-center rounded-md border border-gray-100 bg-gray-50 px-3 py-2 mb-3 mt-4"
>
<div className="flex-1 flex gap-3 items-center border border-gray-100">
  <LuPaperclip
  className="text-gray-400"
  />
  <p className="text-xs text-black">{item}</p>
</div>
<button
 className="cursor-pointer"
 onClick={()=>handleDeleteOption(index)}
 >
    <HiOutlineTrash className="text-lg text-red-500"/>
 </button>

</div>
))}
<div className="flex items-center gap-5 mt-4">
    <div className="flex-1 flex  items-center gap-3 border border-gray-100 rounded-md px-3">
        <LuPaperclip className="text-gray-400" />
        <input type="text"
        className="text-[13px] w-full text-black outline-none bg-white px-3 py-2 rounded-md border border-gray-100 "
        value={option}
        onChange={({target})=>setOption(target.value)}
        placeholder="Enter Attachment"
        />
        
    </div>
    <button
    className="card-btn text-nowrap"
    onClick={handleAddOption}
    >
<HiMiniPlus className="text-lg"/>
Add
    </button>
</div>

  </div>;
};

export default AddAttachmentsInput;
