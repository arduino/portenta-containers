import * as React from "react";
import Box from "@mui/material/Box";
import SvgIcon, { SvgIconProps } from "@mui/material/SvgIcon";

interface SvgCellularSignalProps extends SvgIconProps {
  signal: number;
}

export const SvgCellularSignal = (props: SvgCellularSignalProps) => {
  const { signal, ...svgProps } = props;
  return (
    <SvgIcon
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...svgProps}
    >
      <path d="M1.578 11.553h1.5a.75.75 0 0 1 .75.75v3.75a.75.75 0 0 1-.75.75h-1.5a.75.75 0 0 1-.75-.75v-3.75a.75.75 0 0 1 .75-.75z" />
      <Box
        component="path"
        d="M7.578 7.803h-1.5a.75.75 0 0 0-.75.75v7.5c0 .414.336.75.75.75h1.5a.75.75 0 0 0 .75-.75v-7.5a.75.75 0 0 0-.75-.75z"
        sx={{ opacity: signal > -109 ? 1 : 0.2 }}
      />
      <Box
        component="path"
        d="M10.578 4.053h1.5a.75.75 0 0 1 .75.75v11.25a.75.75 0 0 1-.75.75h-1.5a.75.75 0 0 1-.75-.75V4.803a.75.75 0 0 1 .75-.75z"
        sx={{ opacity: signal > -89 ? 1 : 0.2 }}
      />
      <Box
        component="path"
        d="M15.078.303h1.5a.75.75 0 0 1 .75.75v15a.75.75 0 0 1-.75.75h-1.5a.75.75 0 0 1-.75-.75v-15a.75.75 0 0 1 .75-.75Z"
        sx={{ opacity: signal > -79 ? 1 : 0.2 }}
      />
    </SvgIcon>
  );
};
