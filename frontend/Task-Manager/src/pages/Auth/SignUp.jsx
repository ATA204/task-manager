import React, { useContext, useState } from "react";
import AuthLayout from "../../components/layouts/AuthLayout";
import Input from "./../../components/inputs/Input";
import { validateEmail } from "../../utils/helper";
import ProfilePhotoSelector from "./../../components/inputs/ProfilePhotoSelector";
import { Link, useNavigate } from "react-router-dom";
import axiosInstance from "../../utils/axiosinstance";
import { API_PATHS } from "../../utils/apiPaths";
import { UserContext } from "../../context/UserContext";
import uploadImage from "../../utils/uploadimage";

const SignUp = () => {
  const [profileIPic, setProfilePic] = useState(null);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [adminInviteToken, setAdminInviteToken] = useState("");
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { updateUser } = useContext(UserContext);

  
  const handleSignUp = async (e) => {
    e.preventDefault();
    if (!fullName) {
      setError("Enter your Full Name");
      return;
    }
    if (!validateEmail(email)) {
      setError("Enter a Valid Email");
      return;
    }
    if (!password) {
      setError("Enter Password");
      return;
    }
    setError("");
    let profileImageUrl = "";
    try {
      if(profileIPic){
        const imgUploadRes=await uploadImage(profileIPic)
         profileImageUrl=imgUploadRes.imageUrl||"";
      }
      const response = await axiosInstance.post(API_PATHS.AUTH.REGISTER, {
        name: fullName,
        email,
        password,
        profileImageUrl,
        adminInviteToken,
      });
      const { token, role } = response.data;
      if (token) {
        localStorage.setItem("token", token);
        updateUser(response.data);
        if (role === "admin") {
          navigate("/admin/dashboard");
        } else {
          navigate("/user/dashboard");
        }
      }
    } catch (error) {
      if (error.response && error.response.data.message) {
        setError(error.response.data.message);
      } else {
        console.error("Something went wrong",error);
      }
    }
  };

  return (
    <AuthLayout>
      <div className="lg:w-full  mt-10 md:mt-0 h-auto md:h-full flex flex-col justify-center">
        <h3 className="text-xl font-semibold text-black ">Create an Accounr</h3>
        <p className="text-xs mt-[5px] mb-6 text-slate-700">
          Join Us today by entering your details below.
        </p>
        <form action="" onSubmit={handleSignUp}>
          <ProfilePhotoSelector image={profileIPic} setImage={setProfilePic} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Full Name"
              onChange={({ target }) => setFullName(target.value)}
              placeholder="Mohamed"
              value={fullName}
              type="text"
            />
            <Input
              label="Email Address"
              value={email}
              placeholder="Mohamed@example.com"
              onChange={({ target }) => setEmail(target.value)}
              type="text"
            />
            <Input
              value={password}
              onChange={({ target }) => setPassword(target.value)}
              label="Password"
              placeholder="Min 8 characters"
              type="password"
            />
            <Input
              value={adminInviteToken}
              onChange={({ target }) => setAdminInviteToken(target.value)}
              label="Admin Invite Token"
              placeholder="6-Digit Code"
              type="text"
            />
          </div>
          {error && <p className="text-xs text-red-500 pb-2.5">{error}</p>}
          <button type="submit" className="btn-primary">
            SignUp
          </button>
          <p className="text-[13px] text-slate-800 mt-3">
            Already have an Account{" "}
            <Link className="text-primary underline text-medium" to="/login">
              Login
            </Link>
          </p>
        </form>
      </div>
    </AuthLayout>
  );
};

export default SignUp;
