import * as React from "react";

const ProfileIcon = (props: any) => (
  <svg
    width={20}
    height={23}
    viewBox="0 0 17 21"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <circle
      cx={8.5}
      cy={5.7}
      r={4.7}
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M1 20.2C1 15.6 4.8 12 9.5 12C14.2 12 18 15.6 18 20.2"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export default ProfileIcon;