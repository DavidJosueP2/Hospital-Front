import React from "react";
import { Outlet } from "react-router-dom";

const AuthLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-clinic flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      {/* Background pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(45rem_50rem_at_top,rgba(36,106,254,0.1),transparent)] opacity-30" />

      {/* Content */}
      <div className="relative max-w-md w-full">{children ?? <Outlet />}</div>
    </div>
  );
};

export default AuthLayout;
