import React, { useRef, useState } from "react";
import { LuUser, LuTrash, LuUpload } from "react-icons/lu";

const ProfilePhotoSelector = ({ image, setImage }) => {
  const inputRef = useRef(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      const preview = URL.createObjectURL(file);
      setPreviewUrl(preview);
    }
  };
  const handleRemoveImage = () => {
    setImage(null);
    setPreviewUrl(null);
  };
  const onChooseFile = () => {
    inputRef.current.click();
  };
  return (
    <div className='flex items-center justify-center mb-6'>
      <input type="file" accept="image/*" className="hidden" ref={inputRef} onChange={handleImageChange} />
      {!image ? (
        <div className="w-20 h-20 rounded-full bg-blue-100/50 flex justify-center items-center relative cursor-pointer">
          <LuUser className="text-4xl text-primary" />
          <button
            type="button"
            onClick={onChooseFile}
            className="w-8 h-8 absolute -right-1 -bottom-1 rounded-full bg-primary text-white flex justify-center items-center cursor-pointer"
          >
            <LuUpload />
          </button>
        </div>
      ) : (
        <div className="relative  w-20 h-20 rounded-full ">
          <img src={previewUrl} alt="" className="object-cover w-20 h-20 rounded-full "/>
          <button type="button" className="w-8 h-8 rounded-full bg-red-500 text-white flex justify-center items-center absolute -bottom-1 -right-1 cursor-pointer "
           onClick={handleRemoveImage}
          >
           
            <LuTrash
            className=""
            />
          </button>
        </div>
      )}
    </div>
  );
};

export default ProfilePhotoSelector;
