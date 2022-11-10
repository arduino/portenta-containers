import * as React from "react";
import SvgIcon, { SvgIconProps } from "@mui/material/SvgIcon";

export const SvgCopy = (props: SvgIconProps) => (
  <SvgIcon
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 16 16"
    {...props}
  >
    <g fill="currentColor">
      <path d="M2.375 13a.625.625 0 0 1-.625-.625V1.125A.625.625 0 0 1 2.375.5H6.75a.625.625 0 0 1 0 1.25H3v10.625a.625.625 0 0 1-.625.625Z" />
      <path d="m14.069 8.181-5-5A.645.645 0 0 0 8.625 3h-3.75a.627.627 0 0 0-.625.625v11.25a.627.627 0 0 0 .625.625h8.75a.627.627 0 0 0 .625-.625v-6.25a.645.645 0 0 0-.181-.444ZM9.25 5.131l2.85 2.85L9.25 8ZM13 14.25H5.5v-10H8v4.375a.645.645 0 0 0 .181.444.63.63 0 0 0 .444.181L13 9.231Z" />
    </g>
  </SvgIcon>
);
