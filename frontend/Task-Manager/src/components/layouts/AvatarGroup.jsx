import React from "react";

const AvatarGroup = ({ maxVisible, avatars }) => {
  return (
    <div className="flex items-center">
      {avatars.slice(0, maxVisible).map((avatar, index) => (
        <img
          key={index}
          src={avatar}
          alt={`Avatar ${index}`}
          className="w-9 h-9 rounded-full -ml-3 first:ml-0 border-2 border-white"
        />
      ))}
      {avatars.length > maxVisible && (
        <div className="w-9 h-9 rounded-full flex items-center justify-center bg-blue-50 border-2 border-white text-sm font-medium -ml-3">
          +{avatars.length - maxVisible}
        </div>
      )}
    </div>
  );
};

export default AvatarGroup;
