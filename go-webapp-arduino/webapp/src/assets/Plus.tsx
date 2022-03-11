import * as React from "react";
import SvgIcon, { SvgIconProps } from "@mui/material/SvgIcon";

export const SvgPlus = (props: SvgIconProps) => (
  <SvgIcon
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 13 14"
    {...props}
  >
    <path
      fill="currentColor"
      d="M12.75 7a.627.627 0 0 1-.625.625h-5v5a.625.625 0 1 1-1.25 0v-5h-5a.625.625 0 0 1 0-1.25h5v-5a.625.625 0 0 1 1.25 0v5h5A.627.627 0 0 1 12.75 7Z"
    />
  </SvgIcon>
);
