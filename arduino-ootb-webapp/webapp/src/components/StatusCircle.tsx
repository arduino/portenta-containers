import React from "react";
import { SvgIconProps } from "@mui/material/SvgIcon";
import { SvgCircle } from "../assets/Circle";

export interface StatusCircleProps extends SvgIconProps {
  status: "r" | "g" | "y";
}

function StatusCircleComponent(props: StatusCircleProps) {
  const { status, ...svgIconProps } = props;
  return (
    <SvgCircle
      {...svgIconProps}
      sx={{
        height: "0.8em",
        width: "0.8em",
        marginRight: 1,
        shapeRendering: "geometricPrecision",
        color:
          status === "r"
            ? "error.main"
            : status === "g"
              ? "success.main"
              : "warning.main",
        ...svgIconProps.sx,
      }}
    />
  );
}

export const StatusCircle = React.memo(StatusCircleComponent);
